var config = require('../config/config.js');
var express = require('express');
var app = express();
var router = express.Router()
const jwt = require("jsonwebtoken");
import PDFDocument from 'pdfkit'
const fs = require('fs')
var nodemailer = require("nodemailer");
import { Wallet } from '@ethersproject/wallet'
import { computeAddress } from '@ethersproject/transactions'
import { computePublicKey } from '@ethersproject/signing-key'
import { verify } from 'crypto';
import { stat } from 'fs';
const EthereumEncryption = require('ethereum-encryption');
var QRCode = require('qrcode')
// MySQL
const db = require("../config/db.config.js");

// IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient.create('http://127.0.0.1:5001')

// Contract
const Web3 = require('web3')
const web3 = new Web3('http://127.0.0.1:7545')  
let contract = new web3.eth.Contract(config.ABI_VERIFIER_REGISTRY_CONTRACT, config.RGISTRY_VERIFIER_CONTRACT_ADDRESS)
let contract_holder_registry = new web3.eth.Contract(config.ABI_REGISTRY_CONTRACT, config.RGISTRY_CONTRACT_ADDRESS)
let vp_contract = new web3.eth.Contract(config.ABI_VP_SCHEMA_REGISTRY_CONTRACT, config.VP_SCHEMA_VERIFIER_CONTRACT_ADDRESS)
let contract_issuer = new web3.eth.Contract(config.ABI_ISSUER_REGISTRY_CONTRACT, config.ISSUER_REGISTRY_CONTRACT_ADDRESS)

// JS JSON schema validator
const AJV = require('ajv').default;
const addFormats = require('ajv-formats').default;
const ajv = new AJV({strict: false});
addFormats(ajv);

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
    name: string 
    address: string
    updated?: string
    created?: string
}


const acceptRequest = (id : any) => {
    let query = "UPDATE verificationresponse SET state='1', encrypted=NULL WHERE id=?"
    return new Promise((resolve, reject) => {
        db.query( query, [id], (err: any, res: any) => {
            if (err) {
               console.log("error: ", err);
               reject(err);
            }
            resolve(res);
        });
    });
}

const declineRequest = (id : any) => {
    let query = "UPDATE verificationresponse SET state='2', encrypted=NULL WHERE id=?"
    return new Promise((resolve, reject) => {
        db.query( query, [id], (err: any, res: any) => {
            if (err) {
               console.log("error: ", err);
               reject(err);
            }
            resolve(res);
        });
    });
}

const verifyRequestState = (id : any) : any => {
    let query = "SELECT * FROM verificationresponse WHERE id= '" + id + "' AND state='0'"
    return new Promise((resolve, reject) => {
        db.query(query, [id], (err : any, res : any) => {
            if (err) {
                console.log("error: ", err);
                reject(err);
            }
            resolve(res);
        });
    });
}

const verifyResponse = async (response : any, privateKey: any) : Promise<any> => {
 
    // 1- Decrypt vc with holder Private key
    console.log(" 1- Decrypt vc with holder Private key");
    
    let decrypted ;
    try{
        decrypted = EthereumEncryption.decryptWithPrivateKey(
            privateKey.substr(2), // privateKey
            response.encrypted
        );
    }catch(error){
        console.log("error",error); 
        const result = await Promise.resolve({
            msg : "Verification response encryption not valid",
            test : false
        });
        return result;
    }
    
    decrypted = JSON.parse(decrypted)

    // 2- Verify if service request is pending

    console.log("2- Verify if service request is pending");
    
    
    try {
        verifyRequestState(response.id)
    } catch (error) {
        const result = await Promise.resolve({
            msg : "Request already treated",
            test : false
        });
        return result;
    }

    // 3- Verify schema 

    console.log(" 3- Verify schema ");
    
    let ipfshash
    try {
        ipfshash = await vp_contract.methods.getSchemasPath(response.did_verifier, decrypted.vpSchema.id).call();
        console.log("ipfshash",ipfshash);
    } catch (error) {
        console.log(error);   
    }
    
    
    let vpSchema = await resolveSchema(ipfshash)
    vpSchema = JSON.parse(vpSchema)
   
    const validate = ajv.compile(vpSchema)
    let valid = validate(decrypted)
    /*  if (!valid){
        console.log("schema errors : " ,  validate.errors); 
        const result = await Promise.resolve({
            msg : "Data not valid",
            test : false
        });
        return result;
    } */

    // 4- verify verifiable presentation holder signature 

    console.log("4- verify verifiable presentation holder signature ");
    

    ipfshash = await contract_holder_registry.methods.getDidToHash(decrypted.holder).call();
    let ddo = await resolve(ipfshash)

    let test
    try {
        test = EthereumEncryption.verifyHashSignature(
            ddo.publicKey.substr(2), // publicKey
            decrypted.holderProof.hash , // hash
            decrypted.holderProof.proofValue // signature
        );
    } catch (error) {
        const result = await Promise.resolve({
            msg : "Holder signature Not Valid",
            test : false
        });
        return result;
    }
    if(!test){
        const result = await Promise.resolve({
            msg : "Holder signature Not Valid",
            test : false
        });
        return result;
    }

    // 5- verify verifiable presentation verifier signature 

    console.log("5- verify verifiable presentation verifier signature ");
    

    ipfshash = await contract.methods.getDidToHash(decrypted.verifier).call();
    ddo = await resolve(ipfshash)

    let test2
    try {
        test2 = EthereumEncryption.verifyHashSignature(
            ddo.publicKey.substr(2), // publicKey
            decrypted.verifierProof.hash , // hash
            decrypted.verifierProof.proofValue // signature
        );
    } catch (error) {
        const result = await Promise.resolve({
            msg : "Verifier signature Not Valid",
            test : false
        });
        return result;
    }
    if(!test2){
        const result = await Promise.resolve({
            msg : "Verifier signature Not Valid",
            test : false
        });
        return result;
    }

    // 6- verify verifiable credentials signatures ( issuer & holder signatue )

    console.log("6- verify verifiable credentials signatures ( issuer & holder signatue )");
    
    decrypted.verifiableCredential.forEach( async ( element : any ) => {
        // 6.1-  Verify holder signature
        let ipfshash = await contract_holder_registry.methods.getDidToHash(element.credentialSubject.id).call();
        console.log("ipfshash",ipfshash);
        
        let ddo = await resolve(ipfshash)
        let test
        try {
            test = EthereumEncryption.verifyHashSignature(
                ddo.publicKey.substr(2), // publicKey
                element.holderProof.hash , // hash
                element.holderProof.proofValue // signature
            );
        } catch (error) {
            const result = await Promise.resolve({
                msg : "Holder of " + element.credentialSchema.id + " signature Not Valid",
                test : false
            });
            return result;
        }
        if(!test){
            const result = await Promise.resolve({
                msg : "Holder of " + element.credentialSchema.id + " signature Not Valid",
                test : false
            });
            return result;
        }
        // 6.2- Verify issuer signature
        let ipfshash2 = await contract_issuer.methods.getDidToHash(element.issuer).call();
        console.log("ipfshash2",ipfshash2);
        
        let ddo2 = await resolve(ipfshash2)
        let test2
        try {
            test2 = EthereumEncryption.verifyHashSignature(
                ddo2.publicKey.substr(2), // publicKey
                element.issuerProof.hash , // hash
                element.issuerProof.proofValue // signature
            );
        } catch (error) {
            const result = await Promise.resolve({
                msg : "Issuer of " + element.credentialSchema.id + " signature Not Valid",
                test : false
            });
            return result;
        }
        if(!test2){
            const result = await Promise.resolve({
                msg : "Issuer of " + element.credentialSchema.id + " signature Not Valid",
                test : false
            });
            return result;
        }
    });

    const result = await Promise.resolve({
        msg : "Verification Process Success",
        decrypted: decrypted,
        test : true
    });
    return result; 
}

const generateVerificationResponse = async (data : any) => {

    let ddo
    try {
        const ipfshash = await contract.methods.getDidToHash(data.did_verifier).call();    
        ddo = await resolve(ipfshash)
    } catch (error) {
        console.log(error);    
    }

    const encrypted = EthereumEncryption.encryptWithPublicKey(
        (ddo.publicKey).substr(2), // publicKey of verifier
        JSON.stringify(data.verifiablePresentation) // data
    );
    
    let query = "INSERT INTO verificationresponse (did_holder, did_verifier, encrypted, idRequest) VALUES (?,?,?,?);"

        return new Promise((resolve, reject) => {
            db.query(query, [
                data.did_holder, data.did_verifier, encrypted, data.idRequest
            ], (err : any, res : any) => {
                if (err) {
                    console.log("error: ", err);
                    reject(err);
                }
                resolve(res.insertId);
            });
        });
}

const getVerificationResponseList = (didVerifier : any) : any => {
    
    let query = "SELECT * FROM verificationresponse WHERE did_verifier= '" + didVerifier + "'"
    return new Promise((resolve, reject) => {
        db.query(query, [didVerifier], (err : any, res : any) => {
            if (err) {
                console.log("error: ", err);
                reject(err);
            }
            resolve(res);
        });
    });
}


const declineService = (id : any) => {
    let query = "UPDATE servicesrequests SET state='2' WHERE id=?"
    return new Promise((resolve, reject) => {
        db.query( query, [id], (err: any, res: any) => {
            if (err) {
               console.log("error: ", err);
               reject(err);
            }
            resolve(res);
        });
    });
}

const updateServiceRequestState = (request : any) => {
    let query = "UPDATE servicesrequests SET state='1' WHERE did_holder=? AND verification_request_name=? AND state=?"
    return new Promise((resolve, reject) => {
        db.query( query, [request.did_holder, request.verification_request_name, 0], (err: any, res: any) => {
            if (err) {
               console.log("error: ", err);
               reject(err);
            }
            resolve(res);
        });
    });
}

const sendVerificationRequest = async (request : any , privateKey: any)  => {

    let x = {
        verifier : request.did_verifier,
        verificationTemplate : request.verification_request_name
    }
    const hash = EthereumEncryption.hash(JSON.stringify(x));
    const signature = EthereumEncryption.signHash(
        (privateKey).substr(2), // privateKey of verifier
        hash // hash
    );
    
    let verifierProof = {
        type : "sha3_256",
        created : (new Date(Date.now())).toISOString(),
        hash: hash,
        proofValue : signature
    }

    let data = {
        id_request : request.id,
        verifier : request.did_verifier,
        verificationTemplate : request.verification_request_name,
        verifierSignature : verifierProof
    }

    const ipfshash = await contract_holder_registry.methods.getDidToHash(request.did_holder).call();
    let ddo = await resolve(ipfshash)

    const encrypted = EthereumEncryption.encryptWithPublicKey(
        (ddo.publicKey).substr(2), // publicKey of holder
        JSON.stringify(data) // data
    );

    let qrcodeData = {encrypted, type : "vp"}

    QRCode.toDataURL(JSON.stringify(qrcodeData), {
        type: 'terminal',
        width: '500',
        errorCorrectionLevel: 'M'
    }, function (err : any, url : any) {
        if (err) 
            return console.log("error occured", err)
        emailVerificationRequestFunction(ddo.email, url);
    }) 
    updateServiceRequestState(request)

    return true
}

function emailVerificationRequestFunction(target : String, message : String) {
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
        subject: "Proof Request",
        attachDataUrls: true,
        html: "<h4>Scan the QR code to prove your data in order to get the service requested. </h4><br><img src=" + message + ">"
    };
    transporter.sendMail(mailOptions, function (error : String) {
        if (error) {
            console.log(error);
        }
    });
}

const sendServiceRequest = (data : any) : any => {
    let did_holder = data.did_holder
    let did_verifier = data.did_verifier
    let verification_name = data.verification_name

    let query = "INSERT INTO servicesrequests (did_holder, did_verifier, verification_request_name) VALUES (?,?,?);"

    return new Promise((resolve, reject) => {
        db.query(query, [
            did_holder, did_verifier, verification_name
        ], (err : any, res : any) => {
            if (err) {
                console.log("error: ", err);
                reject(err);
            }
            resolve(res.insertId);
        });
    });

}

const getServicesRequestList = (didVerifier : any) : any => {
    
    let query = "SELECT * FROM servicesrequests WHERE did_verifier= '" + didVerifier + "'"
    return new Promise((resolve, reject) => {
        db.query(query, [didVerifier], (err : any, res : any) => {
            if (err) {
                console.log("error: ", err);
                reject(err);
            }
            resolve(res);
        });
    });
}

const getVerifierList = () : any => {
    let query = "SELECT * FROM verifiers"
    return new Promise((resolve, reject) => {
        db.query(query, (err: any, res: any) => {
            if (err) {
                console.log("error: ", err);
                reject(err);
            }
            resolve(res);
        });
    });
}

const verifyVerificationRequest = async (encrypted : any, privateKey : any ) : Promise<any> => {
    // 1- Decrypt vc with holder Private key
    let decrypted ;
    try{
        decrypted = EthereumEncryption.decryptWithPrivateKey(
            privateKey.substr(2), // privateKey
            encrypted
        );
        console.log(decrypted);
        
    }catch(error){
        console.log("error",error); 
        const result = await Promise.resolve({
            msg : "Data encryption not valid, It is not up to you",
            test : false
        });
        return result;
    }

    decrypted = JSON.parse(decrypted)
   
    
    // 2- Verify Verifier Signature
    let ddo
    try {
        const ipfshash = await contract.methods.getDidToHash(decrypted.verifier).call();    
        ddo = await resolve(ipfshash)
    } catch (error) {
        const result = await Promise.resolve({
            msg : "Resolve error",
            test : false
        });
        return result;
    }
   

    let valid
    try {
        valid = EthereumEncryption.verifyHashSignature(
            ddo.publicKey.substr(2), // publicKey
            decrypted.verifierSignature.hash , // hash
            decrypted.verifierSignature.proofValue // signature
        );
    } catch (error) {
        const result = await Promise.resolve({
            msg : "1- Verification request signature Not Valid",
            test : false
        });
        return result;
    }
    if(!valid){
        const result = await Promise.resolve({
            msg : "2- Verification request signature Not Valid",
            test : false
        });
        return result;
    }

    let vpSchema 
    try {
        let ipfspath = await vp_contract.methods.getSchemasPath(decrypted.verifier, decrypted.verificationTemplate).call();
        vpSchema = await resolveSchema(ipfspath)
    } catch (error) {
        
    }
    const result = await Promise.resolve({
        msg : "Verification Process Success",
        verificationTemplate: vpSchema,
        decrypted : decrypted,
        test : true
    });
    return result;  

}

router.post('/api/verifyVerificationRequest', async (req : any, res : any) => {
    let privateKey = req.body.privateKey
    let encrypted = req.body.encrypted
    
    let result = await verifyVerificationRequest(encrypted, privateKey) 
    res.json({result})
})

const createKeyPair = (): KeyPair => {
    const wallet = Wallet.createRandom()
    const privateKey = wallet.privateKey
    const address = computeAddress(privateKey)
    const publicKey = computePublicKey(privateKey, true)
    return { address, privateKey, publicKey }
}

const generateDID = (publicKey: string): string => {
    return `did:exemple:${publicKey}`
}

const createDDO = (identifier: string, publicKey: string, email: string,name:string,address:string): DidDocument => {
    return {
        '@context': 'https://w3id.org/did/v1',
        '@type': 'Verifier',
        id: identifier,
        publicKey: publicKey,
        address: address,
        email: email,
        name: name, 
        created: (new Date(Date.now())).toISOString()
    } 
};

const pushDDO_ipfs = async (_ddo: DidDocument): Promise<String> => {
    const cid = await ipfs.add(JSON.stringify(_ddo))
    return cid
}

const updateStatus = (data: any): any => {
    let ID = data
    let query = "Update verifiers SET state='1' where id =" + ID
    return new Promise(() => {
        db.query(query, [ID])
    })
}

const resolve = async (ipfsHash: String)  : Promise<any> => {
    let asyncitr = ipfs.cat(ipfsHash)
    let data
    for await (const itr of asyncitr) {
        data = Buffer.from(itr).toString()    
    } 
    return JSON.parse(data.toString());
} 

const resolveSchema = async (ipfsHash: String)  : Promise<any> => {
    //let res= await ipfs.get(ipfsHash)
    let asyncitr = await ipfs.cat(ipfsHash)
    
    let mainContent="";
    for await(const itr of asyncitr){
        mainContent+=itr.toString();
    }
    return mainContent
}

const UpdateVerifier = (identifier : any,publicKey:any, address:any,id:any) : any => { 

    let query = "UPDATE verifiers SET did='" + identifier + "' , publicKey ='" + publicKey + "' , address ='" + address + "' WHERE id=" + id 
    return new Promise(() => {
        db.query( query, [identifier, publicKey, address, id] ) 
        
    });
}

const updateStatusDeclined = (data: any): any => {
    let ID = data
    console.log(ID)
    let query = "Update verifiers SET state='2' where id =" + ID
    return new Promise(() => {
        db.query(query, [ID])
    })
}

function emailSenderFunction(target: String, message: String,numero: String,identifier:String,doc:any) {
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
        attachments: [{
            filename: 'KeyFileStore.pdf',
            path: 'C:/Users/ASUS/OneDrive/Bureau/PFE_SSI/backend/public/files/example.pdf',
            contentType: 'application/pdf'
          }],

        html:
            "<h4>Your DID request as a trusted organization has been approved. <h4>Decentralized IDentifier (did):"+identifier+"</h4> </h4><br><h4>Use this link to login with the following code</h4><br>" + message + "<br>"+"Password : "+numero
        ,
    };
    transporter.sendMail(mailOptions, function (error: String) {
        if (error) {
            console.log(error);
        }
    });
}

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

router.post('/api/createVerifier',async (req : any , res : any) => {

    let email = req.body.email
    let name = req.body.name 
    let id = req.body.id

    // generate wallet
    let _keypair: KeyPair
    _keypair = createKeyPair()
    let publickey = _keypair.publicKey
    let address = _keypair.address
    let privateKey = _keypair.privateKey

    // 1- generateDID
    const identifier = generateDID(publickey)
    // 2- Generate did doc
    const ddo = createDDO(identifier, publickey, email,name, address)
    // 3- add did doc to ipfs and get the cid
    const cid = await pushDDO_ipfs(ddo)
    
    // 4 - update status il
    const status = updateStatus(id)

    UpdateVerifier(identifier, publickey, address, id)

    var characters = '0123456789';
    var charactersLength = characters.length;
    let result="";
    for (var i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    let type = "verifier"
    const token = jwt.sign(
       
     { identifier,result,type},'d8b595680851765f38ea5405129244ba3cbad84467d190859f4c8b20c1ff6c75',
       {
         expiresIn: "1h",
       }
     )
       
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream('C:/Users/ASUS/OneDrive/Bureau/PFE_SSI/backend/public/files/example.pdf'));

        doc.image('C:/Users/ASUS/OneDrive/Bureau/PFE_SSI/backend/public/images/argon-react.png', {
            fit: [120, 120],
            align: 'center',
            valign: 'center', 
            
        })
        .text("Organization")
        .text(name)
        doc.moveTo(500, 200)
        .text("Your DID has been approved, these are your credentials", 80, 300)
        .text("Did")
        .text(identifier)
        .text("Address")
        .text(address)
        .text("Private Key")
        .text(privateKey)
        .text("Public Key")
        .text(publickey)
        .end();

    emailSenderFunction(email, "http://localhost:3000/auth/password/"+token,result,identifier,doc);
  
    res.json({ identifier, cid, status })
})

router.get('/api/VerifierList', async (req : any , res : any) => {
    const list = await getVerifierList()
    res.json({list})
})

router.post('/api/mappingDidToHashVerifier', async (req : any , res : any) => {
    let _cid = req.body.cid
    let _did = req.body.did
    let accounts = await web3.eth.getAccounts()
    const result = await contract.methods.setDidToHash(_did,_cid).send({from: accounts[0],
        gas:3000000});
    res.json({result}) 
}) 

router.post('/api/resolveVerifier', async (req : any , res : any) => {
    let did = req.body.did
    console.log(did)
    const ipfshash = await contract.methods.getDidToHash(did).call();
    console.log("hash",ipfshash)
    let ddo = await resolve(ipfshash)
    res.json({ipfshash,ddo}) 
}) 

router.post('/api/createVerifierFailed', async (req: any, res: any) => {
    let email = req.body.email
    let id = req.body.id
    emailSenderFailure(email)
    const status = updateStatusDeclined(id)
    res.json({ status })
})

router.post('/api/verificationRequest', async (req : any, res : any) => {
    let _request = {
        did_holder: req.body.did_holder,
        did_verifier: req.body.did_verifier,
        verification_name: req.body.verification_name
    }
    const id = await sendServiceRequest(_request)
    if(id){
        res.json({done : true})
    }
})

router.post('/api/servicesRequestList', async (req : any, res : any) => {
    let didVerifier = req.body.didVerifier
    const list = await getServicesRequestList(didVerifier)
    res.json({list})
})

router.post('/api/sendVerificationRequest', async (req : any, res : any) => {
    let done = sendVerificationRequest(req.body.request , req.body.privateKey)
    res.json({done})
})

router.post('/api/generateVerificationResponse',async (req : any , res : any) => {
    generateVerificationResponse(req.body.data)
    res.json({done : true})
})

router.post('/api/verificationResponseList', async (req : any, res : any) => {
    let didVerifier = req.body.didVerifier
    const list = await getVerificationResponseList(didVerifier)
    res.json({list})
})

router.post('/api/declineRequest', async (req: any, res: any) => {
    let id = req.body.id
    declineRequest(id)
    res.json({done : true})
})

router.post('/api/declineService', async (req: any, res: any) => {
    let id = req.body.id
    declineService(id)
    res.json({done : true})
})

router.post('/api/acceptRequest', async (req: any, res: any) => {
    let id = req.body.id
    acceptRequest(id)
    res.json({done : true})
})

router.post('/api/verifyResponse', async (req : any, res : any) => {
    let response = req.body.response
    let privateKey = req.body.privateKey
    let result = await verifyResponse(response,privateKey)
    res.json({result})
})

module.exports = router;