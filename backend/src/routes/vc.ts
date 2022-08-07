var config = require('../config/config.js');
var nodemailer = require("nodemailer");
var QRCode = require('qrcode')
var express = require('express');
var app = express();
const router = express.Router()
const db = require("../config/db.config.js");

const jwt = require("jsonwebtoken");
const EthereumEncryption = require('ethereum-encryption');
import {EthrDID} from 'ethr-did'
// Contract
const Web3 = require('web3')
const web3 = new Web3('http://127.0.0.1:7545')  
let issuerContract = new web3.eth.Contract(config.ABI_ISSUER_REGISTRY_CONTRACT, config.ISSUER_REGISTRY_CONTRACT_ADDRESS)
let schemaContract = new web3.eth.Contract(config.ABI_SCHEMA_REGISTRY_CONTRACT, config.RGISTRY_SCHEMA_CONTRACT_ADDRESS)


// JS JSON schema validator
const AJV = require('ajv').default;
const addFormats = require('ajv-formats').default;
const ajv = new AJV({strict: false});
addFormats(ajv);


// IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient.create('http://127.0.0.1:5001')

// Request vc from issuer

const sendVCRequest = (data : any) : any => {
    let did_holder = data.did_holder
    let did_issuer = data.did_issuer
    let vc_name = data.vc_name

    let query = "INSERT INTO vcrequest (did_holder, did_issuer, vc_name) VALUES (?,?,?);"

    return new Promise((resolve, reject) => {
        db.query(query, [
            did_holder, did_issuer, vc_name
        ], (err : any, res : any) => {
            if (err) {
                console.log("error: ", err);
                reject(err);
            }
            resolve(res.insertId);
        });
    });

}

// Get VC creation requests

const getVCRequestList = (data : any) : any => {
    let didIssuer = data

    let query = "SELECT * FROM vcrequest WHERE did_issuer= '" + didIssuer + "'"
    return new Promise((resolve, reject) => {
        db.query(query, [didIssuer], (err : any, res : any) => {
            if (err) {
                console.log("error: ", err);
                reject(err);
            }
            resolve(res);
        });
    });
}

const getVCRequestListByHolder = (didHolder : any) : any => {

    let query = "SELECT * FROM vcrequest WHERE did_holder= '" + didHolder + "'"
    return new Promise((resolve, reject) => {
        db.query(query, [didHolder], (err : any, res : any) => {
            if (err) {
                console.log("error: ", err);
                reject(err);
            }
            resolve(res);
        });
    });
}

const updateStatusDeclined = (data : any) : any => {
    let ID = data
    console.log(ID)
    let query = "Update vcrequest SET state='2' where id =" + ID
    return new Promise(() => {
        db.query(query, [ID])
    })
} 

router.post('/api/vcRequest', async (req : any, res : any) => {
    let _request = {
        did_holder: req.body.did_holder,
        did_issuer: req.body.did_issuer,
        vc_name: req.body.vc_name
    }
    const id = await sendVCRequest(_request)
    res.json({id})
})

router.post('/api/vcRequestList', async (req : any, res : any) => {
    let didIssuer = req.body.didIssuer
    const list = await getVCRequestList(didIssuer)
    res.json({list})
})

router.post('/api/vcRequestListByHolder', async (req : any, res : any) => {
    let didholder = req.body.didholder
    const list = await getVCRequestListByHolder(didholder)
    res.json({list})
})

var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var charactersLength = characters.length;
let result = "";
for (var i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
}

/*
const data = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "id": "urn:did:123456",
    "type": ["VerifiableCredential", "PersonalID"],
    "issuer": "did:exemple:9999999",
    "issuanceDate": "2021-11-01T00:00:00Z",
    "credentialSubject": {
        "id": "did:exemple:123",
        "firstName": "Mahrzia",
        "dateOfBirth": "1997-08-07"
    },
    "credentialSchema": {
        "id": "https://exemple/personlId",
        "type": "JsonSchemaValidator2018"
    }
}
*/

// Update status after creating VC

const updateStatus = (data : any) : any => {
    let query = "UPDATE vcrequest SET state='1' WHERE did_holder=? AND vc_name=? AND state=?"
    return new Promise((resolve, reject) => {
        db.query( query, [data.did_holder, data.vc_name, data.state], (err: any, res: any) => {
            if (err) {
               console.log("error: ", err);
               reject(err);
            }
            resolve(res);
        });
    });
}


router.post('/api/issueVC', async (req : any, res : any) => {
    let {formData} = req.body.formData
    //let didHolder = formData.id
    let request = req.body.item
    let did = req.body.did
    let privateKey = (req.body.privateKey).substr(2)
    let ddo = req.body.ddo
   

    let VerifiableCredential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: 'credential/' + result,
        type: [
            "VerifiableCredential", request.vc_name
        ],
        issuer: did,
        issuanceDate: (new Date(Date.now())).toISOString(),
        credentialSubject: {},
        credentialSchema: {
            "id": request.vc_name,
            "type": "JsonSchemaValidator2018"
        },
        issuerProof: {}
    }
    let k = {}

    Object.keys(formData).map(function (key, index) {
            console.log(key, "****", formData[key], index)
            const k1 = formData[key]
            k = {
                ... k,
                [key]: k1
            }
    });
    
    Object.assign(VerifiableCredential.credentialSubject, k)

    //console.log("VerifiableCredential : ",VerifiableCredential);
    

    const hashVC = EthereumEncryption.hash(JSON.stringify(VerifiableCredential));
    const signatureVC = EthereumEncryption.signHash(
        privateKey, // privateKey of  issuer
        hashVC // hash
    );
    
    //console.log("signatureVC by Issuer: ",signatureVC);
 
    VerifiableCredential.issuerProof = {
        type : "sha3_256",
        created : (new Date(Date.now())).toISOString(),
        hash: hashVC,
        proofValue : signatureVC
    }

    //console.log("VerifiableCredential with proof : ",VerifiableCredential);

    const encrypted = EthereumEncryption.encryptWithPublicKey(
        (ddo.publicKey).substr(2), // publicKey of holder
        JSON.stringify(VerifiableCredential) // data
    );

    const status = updateStatus(request)

    let qrcodeData = {encrypted, type : "vc"}

    QRCode.toDataURL(JSON.stringify(qrcodeData), {
        type: 'terminal',
        width: '500',
        errorCorrectionLevel: 'M'
    }, function (err : any, url : any) {
        if (err) 
            return console.log("error occured", err)
        emailSenderFunction(ddo.email, url);
    }) 
    res.json({done : true})
})

/** Verify VC sTART*/

const resolveSchema = async (ipfsHash: String)  : Promise<any> => {
    //let res= await ipfs.get(ipfsHash)
    let asyncitr = await ipfs.cat(ipfsHash)
    
    let mainContent="";
    for await(const itr of asyncitr){
        mainContent+=itr.toString();
    }
    return mainContent
}

const resolveIssuerDDO = async (ipfsHash: String)  : Promise<any> => {

    let asyncitr = ipfs.cat(ipfsHash)

    for await (const itr of asyncitr) {
        let data = Buffer.from(itr).toString()
        return JSON.parse(data.toString());
    } 
}


const verifyVC = async (encrypted : any, privateKey : any ) : Promise<any> => {

    // 1- Decrypt vc with holder Private key
    let decrypted ;
    try{
        decrypted = EthereumEncryption.decryptWithPrivateKey(
            privateKey.substr(2), // privateKey
            encrypted
        );
    }catch(error){
        console.log("error",error); 
        const result = await Promise.resolve({
            msg : "Credential encryption not valid",
            test : false
        });
        return result;
    }
    
    decrypted = JSON.parse(decrypted)
    
    // 2- Verify Schema
    const ipfshash = await schemaContract.methods.getSchemasPath(decrypted.issuer, decrypted.credentialSchema.id).call();
    let vcSchema = await resolveSchema(ipfshash)
    vcSchema = JSON.parse(vcSchema)
    const validate = ajv.compile(vcSchema)
    const valid = validate(decrypted)
    if (!valid){
        const result = await Promise.resolve({
            msg : validate.errors,
            test : false
        });
        return result;
    }
    // 3- Verify Issuer Signature
    else {
        // Resolve Issuer ddo      
        const ipfshash = await issuerContract.methods.getDidToHash(decrypted.issuer).call();
        const ddo = await resolveIssuerDDO(ipfshash)

        let valid
        try {
            valid = EthereumEncryption.verifyHashSignature(
                ddo.publicKey.substr(2), // publicKey
                decrypted.issuerProof.hash , // hash
                decrypted.issuerProof.proofValue // signature
            );
        } catch (error) {
            const result = await Promise.resolve({
                msg : "Credential signature Not Valid",
                test : false
            });
            return result;
        }
        if(!valid){
            const result = await Promise.resolve({
                msg : "Credential signature Not Valid",
                test : false
            });
            return result;
        }
    }
    const result = await Promise.resolve({
        msg : "Verification Process Success",
        decrypted: decrypted,
        test : true
    });
    return result; 
}

router.post('/api/verifyVC', async (req : any, res : any) => {
    let privateKey = req.body.privateKey
    let encrypted = req.body.encrypted
    
    let result = await verifyVC(encrypted, privateKey) 
    res.json({result})
})

/** Verify VC END*/

/** Sign Vc Start */

const add_holder_sig = (VerifiableCredential : any, privateKey : any ) : any => {
    const hashVC = EthereumEncryption.hash(JSON.stringify(VerifiableCredential));
    const signatureVC = EthereumEncryption.signHash(
        privateKey.substr(2), // privateKey of holder
        hashVC // hash
    );  
    const holderProof = {
        type : "sha3_256",
        created : (new Date(Date.now())).toISOString(),
        hash: hashVC,
        proofValue : signatureVC
    }
    VerifiableCredential = {...VerifiableCredential, holderProof: holderProof}
    return VerifiableCredential
}

router.post('/api/signVC', async (req : any, res : any) => {
    let privateKey = req.body.privateKey
    let vc = req.body.vc
    let result = add_holder_sig(vc, privateKey)
    res.json({result})
})


/** Sign Vc end */
router.post('/api/createVCFailed', async (req: any, res: any) => {
    let id = req.body.id
    let email = req.body.email
    emailSenderFailure(email)
    updateStatusDeclined(id)
    res.json({done : true})
})

function emailSenderFunction(target : String, message : String) {
    const transporter = nodemailer.createTransport({
        host: config.MAIL_HOST,
        port: config.MAIL_PORT,
        auth: {
            user: config.MAIL_USER ,
            pass: config.MAIL_PASS
        }
    });
   
    var mailOptions = {
        from: config.MAIL_FROM_ADDRESS,
        to: target,
        subject: "VC Issuance",
        attachDataUrls: true,
        html: "<h4>Scan the QR code to get your Verifiable credentials. </h4><br><img src=" + message + ">"
    };
    transporter.sendMail(mailOptions, function (error : String) {
        if (error) {
            console.log(error);
        }
    });
}


// Email function when failure
function emailSenderFailure(target : String) {
    const transporter = nodemailer.createTransport({
        host: config.MAIL_HOST,
        port: config.MAIL_PORT,
        auth: {
            user: config.MAIL_USER ,
            pass: config.MAIL_PASS
        }
    });
   
    var mailOptions = {
        from: config.MAIL_FROM_ADDRESS,
        to: target,
        subject: "VC Issuance Request Declined",
        text: "VC Issuance Request Declined",
        html: "<h4>Your request has been declined due to integrity and security reasons. </h4>  "
    };
    transporter.sendMail(mailOptions, function (error : String) {
        if (error) {
            console.log(error);
        }
    });
}
module.exports = router;
