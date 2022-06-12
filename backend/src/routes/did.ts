import { computeAddress } from '@ethersproject/transactions'
import { computePublicKey } from '@ethersproject/signing-key'
import { Wallet } from '@ethersproject/wallet'
var nodemailer = require("nodemailer");
var QRCode = require('qrcode')

var config = require('../config/config.js');

var express = require('express');
const router = express.Router()


// IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient.create('http://127.0.0.1:5001')

// Contract
const Web3 = require('web3')
const web3 = new Web3('http://127.0.0.1:7545')  
let contract = new web3.eth.Contract(config.ABI_REGISTRY_CONTRACT, config.RGISTRY_CONTRACT_ADDRESS)

// MySQL
const db = require("../config/db.config.js");

// Types
export type KeyPair = {
    address: string
    privateKey: string
    publicKey: string
}

export interface DidDocument {
    '@context': string | string[]
    '@type': string // Citizen / Organization
    id: string
    publicKey: string
    email: string
    updated?: string
    created?: string
}

  
/**
 *  1- createKeyPair
 */

const createKeyPair = (): KeyPair => {
    const wallet = Wallet.createRandom()
    const privateKey = wallet.privateKey
    const address = computeAddress(privateKey)
    const publicKey = computePublicKey(privateKey, true)
    return { address, privateKey, publicKey }
}

/**
 *  2- Request DID from did issuer
 */

const sendDidRequest = (data : any ) : any => {

    let query = "INSERT INTO didrequest (firstname, lastname, email, address, publickey) VALUES (?, ?, ?, ?, ?);"
    
    return new Promise((resolve, reject) => {
        db.query( query, [ data.firstname, data.lastname, data.email, data.address, data.publickey ] , (err : any, res : any) => {
            if (err) {
              console.log("error: ", err);
              reject(err);
            }
            resolve(res.insertId);
        });
    });
}

/**
 *  3- Get Did list requests
 */

const getDidRequestList = () : any => {
    let query = "SELECT * FROM didrequest"
    return new Promise((resolve, reject) => {
        db.query( query, (err: any, res: any) => {
            if (err) {
               console.log("error: ", err);
               reject(err);
            }
            resolve(res);
        });
    });
}

/**
 *  4- Generate DID
 */

const generateDID = (publicKey: string): string => {
    return `did:exemple:${publicKey}`
}

/**
 * 5- Create an Identity Document containing the Public Key
 */

const createDDO = (identifier: string, publicKey: string, email: string): DidDocument => {
    return {
        '@context': 'https://w3id.org/did/v1',
        '@type': 'Citizen',
        id: identifier,
        publicKey: publicKey,
        email: email,
        created: (new Date(Date.now())).toISOString()
    } //YYYY-MM-DDTHH:mm:ss.sssZ
};

/**
 * 6- Publish Identity Document to IPFS
*/

const pushDDO_ipfs = async (_ddo: DidDocument): Promise<String> => {
    const cid = await ipfs.add(JSON.stringify(_ddo))
    return cid
} 

/**
 * Resolve ddo
 */

const resolve = async (ipfsHash: String)  : Promise<any> => {
    //let res= await ipfs.get(ipfsHash)
    let asyncitr = ipfs.cat(ipfsHash)
    console.log(asyncitr)
    let data 
    for await (const itr of asyncitr) {
        data = Buffer.from(itr).toString()
    } 
    return JSON.parse(data.toString());
} 

/**
 * 7- Update status after creating DID 
*/

const updateStatus = (data: any): any => {
    let ID = data
    console.log(ID)
    let query = "Update didrequest SET state='1' where id =" + ID
    return new Promise(() => {
        db.query(query, [ID])
    })
}

const updateStatusDeclined = (data: any): any => {
    let ID = data
    console.log(ID)
    let query = "Update didrequest SET state='2' where id =" + ID
    return new Promise(() => {
        db.query(query, [ID])
    })
}
/**
 *  Create a did-JWT
 */

/* const createDidJWT = async(): Promise<any> => {
    let keypair = createKeyPair()
    
    const signer = didJWT.ES256KSigner(didJWT.hexToBytes(keypair.privateKey), true)
    const options = {
        signer: signer,
        alg: 'ES256K',
        issuer: 'did:exemple:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74',
    }
    const payload = {
        aud: keypair.identifier, 
        iss: 'did:exemple:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74',
        iat: Math.floor(Date.now() / 1000)
    }

    return didJWT.createJWT(payload, options)
    
} */

/**
 *  Routes
 */

router.get('/api/createKeyPair', (req : any , res : any) => {
    let _keypair: KeyPair
    _keypair = createKeyPair()
    res.json({_keypair})
})

router.post('/api/didRequest', async (req : any , res : any) => {
    let _request = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        address : req.body.address,
        publickey: req.body.publickey
    }
    const id = await sendDidRequest(_request)
    console.log(id)
    res.json({id})
})

router.get('/api/didRequestList', async (req : any , res : any) => {
    const list = await getDidRequestList()
    res.json({list})
})

router.post('/api/createIdentity', async (req : any , res : any) => {
    let publickey = req.body.publickey
    let email = req.body.email
    let id = req.body.id

    // 1- generateDID
    const identifier = generateDID(publickey)
    // 2- Generate did doc
    const ddo = createDDO(identifier, publickey, email)
    // 3- add did doc to ipfs and get the cid
    const cid = await pushDDO_ipfs(ddo)
    // 4- Generate QR code and send Email
    QRCode.toDataURL(identifier, { type: 'terminal' }, function (err: any, url: any) {
        if (err) return console.log("error occured")
        emailSenderFunction(email, url);
    })
    // 5- Update request status
    const status = updateStatus(id)
    res.json({ identifier, cid, status })
})

router.post('/api/createIdentityFailed', async (req: any, res: any) => {
    let email = req.body.email
    let id = req.body.id
    emailSenderFailure(email)
    const status = updateStatusDeclined(id)
    res.json({ status })
})

// Ethereum tx registring ipfs hash 
router.post('/api/mappingDidToHash', async (req : any , res : any) => {
    let _cid = req.body.cid
    let _did = req.body.did
    let accounts = await web3.eth.getAccounts()
    const result = await contract.methods.setDidToHash(_did,_cid).send({from: accounts[0],
        gas:3000000});
    res.json({result}) 
}) 

// Resolve DID 
router.post('/api/resolve', async (req : any , res : any) => {
    let did = req.body.did
    console.log(did)
    const ipfshash = await contract.methods.getDidToHash(did).call();
    console.log("hash",ipfshash)
    let ddo = await resolve(ipfshash)
    
    res.json({did,ipfshash,ddo}) 
}) 

/* router.get('/api/Jwt', async (req : any , res : any) =>{
    let jwt = await createDidJWT()
    let decode = didJWT.decodeJWT(jwt)
    res.json({jwt ,decode})
})
*/


// Email function when success 
function emailSenderFunction(target: String, message: String) {
    const transporter = nodemailer.createTransport({
        host: config.MAILTRAP_HOST,
        port: config.MAILTRAP_PORT,
        auth: {
            user: config.MAILTRAP_USER ,
            pass: config.MAILTRAP_PASS
        }
    });
   
    var mailOptions = {
        from: config.MAILTRAP_FROM_ADDRESS,
        to: target,
        subject: "DID Issuance",
        attachDataUrls: true,

        html:
            "<h4>Your request has been approved. </h4><br><h4>Scan the QR code to get your DID. </h4><br><img src=" + message + ">"
        ,
    };
    transporter.sendMail(mailOptions, function (error: String) {
        if (error) {
            console.log(error);
        }
    });
}


// Email function when failure
function emailSenderFailure(target: String) {
    const transporter = nodemailer.createTransport({
        host: config.MAILTRAP_HOST,
        port: config.MAILTRAP_PORT,
        auth: {
            user: config.MAILTRAP_USER ,
            pass: config.MAILTRAP_PASS
        }
    });
   
    var mailOptions = {
        from: config.MAILTRAP_FROM_ADDRESS,
        to: target,
        subject: "DID Issuance Request Declined",
        text: "DID Issuance Request Declined",
        html:
            "<h4>Your request has been declined due to integrity and security reasons. </h4>  "

        ,
    };
    transporter.sendMail(mailOptions, function (error: String) {
        if (error) {
            console.log(error);
        }
    });
}

module.exports = router;