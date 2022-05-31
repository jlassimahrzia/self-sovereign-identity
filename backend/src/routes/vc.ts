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
const ajv = new AJV();
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

// Update status after creating VC

const updateStatus = (data : any) : any => {
    let ID = data
    console.log(ID)
    let query = "Update vcrequest SET state='1' where did_holder =" + "'" + ID + "'"
    return new Promise(() => {
        db.query(query, [ID])
    })
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

router.post('/api/issueVC', async (req : any, res : any) => {
    let {formData} = req.body.formData
    let didHolder = formData.id
    let schemaName = req.body.schemaName
    let did = req.body.did
    let privateKey = (req.body.privateKey).substr(2)
    let holder_pubKey = (req.body.holder_pubKey).substr(2)
   

    let VerifiableCredential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: 'credential/' + result,
        type: [
            "VerifiableCredential", schemaName
        ],
        issuer: did,
        issuanceDate: (new Date(Date.now())).toISOString(),
        credentialSubject: {},
        credentialSchema: {
            "id": schemaName,
            "type": "JsonSchemaValidator2018"
        },
        issuerProof: {}
    }
    let k = {}

    Object.keys(formData).map(function (key, index) {
        //if (index !== 0) {
            console.log(key, "****", formData[key], index)

            //const hash = EthereumEncryption.hash(formData[key]);
            /*const signature = EthereumEncryption.signHash(privateKey, // privateKey of issuer
            hash // hash
            );*/
            /* const k1 = {
                "value": formData[key],
                "proof": signature
            } */
            const k1 = formData[key]
            k = {
                ... k,
                [key]: k1
            }
        //}
    });
    
    Object.assign(VerifiableCredential.credentialSubject, k)

    console.log("VerifiableCredential : ",VerifiableCredential);
    

    const hashVC = EthereumEncryption.hash(JSON.stringify(VerifiableCredential));
    const signatureVC = EthereumEncryption.signHash(
        privateKey, // privateKey of  issuer
        hashVC // hash
    );
    
    console.log("signatureVC by Issuer: ",signatureVC);

    // const valid = EthereumEncryption.verifyHashSignature(
    //     "035a0020899a5059ce2a69a51d32c9e3992a210935f25b8529af9ca11acdc3d350", // publicKey
    //     hashVC, // hash
    //     signatureVC // signature
    // );
    
    // console.log(valid)
 
    VerifiableCredential.issuerProof = {
        type : "sha3_256",
        created : (new Date(Date.now())).toISOString(),
        hash: hashVC,
        proofValue : signatureVC
    }

    console.log("VerifiableCredential with proof : ",VerifiableCredential);

    /*     
        const token = jwt.sign(VerifiableCredential, privateKey,
        // private key of issuer
        {expiresIn: "1h"})
    */

    const encrypted = EthereumEncryption.encryptWithPublicKey(
        holder_pubKey, // publicKey of holder
        JSON.stringify(VerifiableCredential) // data
    );


    console.log("encrypted : ", encrypted)

    
    //res.json({formData})

    /* let message = EthereumEncryption.decryptWithPrivateKey(
        "0x317dd1db15e0bf7eee38b212568a85c95023965cbd43c54a7528ca7523d5854e", // privateKey
        encrypted
    );
    console.log("message", message) */
    const status = updateStatus(didHolder)

    //const value = JSON.stringify(VerifiableCredential)

    //console.log(token)
    // console.log(JSON.parse(value).vc.credentialSubject.name)

    QRCode.toDataURL(encrypted, {
        type: 'terminal',
        width: '500',
        errorCorrectionLevel: 'M'
    }, function (err : any, url : any) {
        if (err) 
            return console.log("error occured", err)
        emailSenderFunction('jlassimahrzia111@gmail.com', url);
    }) 
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
            "0333eec583d04a55ce0aba9dbfb04035e8c6de4f501ecc9b26c08fa501a5ec15079c2f315e2222bbb2abf214b11eae61f7d1907b01eb0849a3d458d8755ef142315467d48571b319e8347eb0e42cb9bffe5050c433b3977a8e9e64faf36d19a31c760d5bfc4e8c9de32afcc3f1bc1dca36cfbaca541b55120aee231972094f0188e6a5996dd29c62e1ef5b3d46010fefc405d50e0e3302bebeb0819876f4a6cdd630cca7a156faea865a1b6f5867ff030e5d6a4ba5725fd245628a7e45e67fcbe3425b3cec1fe05b041e6fdc377d77c95976ce265083111ed90feecc3ca5db1b5169f0b08e48c86d2d12f346fa1a29ef4d83e2a392cf40cd1b066b5073deb9818b68febe0c0ba1209c76b7000aead4ae04f7e9fcf59e60d6f5440648f8ae5cce35d94595aec278903c8224cc52fc83aaa5bdca672df0bb01f6f8935f2172f7ce284d232b2a0079ef033706f059d7ff0b970c2a04f971dda2dfff2284fca6a65590fae697e89cba16ea83ca4742010d0d3f18e5ff96613337686dafccce1aa67060c999615667bfea9ced223bd745e3ea0bc6f518fccc871c8b6b55ef3135c301741ab110694e17395dc752eca86f4f5ee82c7826c2380baee5d0e4e2ad950fdfcd3b2c843e90a6c825f28fc345e4331d17e0491f98a30d734604500cc6fd347e9de6a280ad2d74787924f889c1ac448fa2cda5ac97be9b39b71dae88943ef54d62def26de4397b38b75d72ad77eba5cf8f6f030749263c0f925945aa3733c1be8a776e27d1b86c6fcd1f2660ae63c817a8993add5a39a85c8252d2c651af3ad164e1be2d7578470b09cbb0b063abeb5f449cbc432ed78b4635c32e4a70e4e852f8c54f43527e0bf43ee3ee5d162e430986fe03312f83f088eb0455cc44f7dbaabc71c168bf5965b5f84f38755f377f460038c7e2fd17e7fbe5db5c74dbee3f2f297e7b7ab8ebddb4bb848b8afa7bd947d643d6621d0ea40163b696b17fd8f27fb0ef7f9eb2cbac320759cc08dd7d4a252c94a5fbc52a8dc4176239e48dd98a898855cfd3a0fb20014091ecb2197d571be200ec7717d0528c93059c7d99b97f2fd0de3eb746db193b9e67bace253e1ff261baaae5448b542353746b20d5e08bab49b2e9ebcda6c123e2ae1e3120c0ddf555e3d7d17116a6b5e7394db68e9a2694df02f2f7041ef406d7a811f61531abd1ac391bb4175237e148c4c525d1cde897b6"
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
router.post('/api/createVCFailed ', async (req: any, res: any) => {
 let id = req.body.id
    emailSenderFailure('jlassimahrzia111@gmail.com')
    const status = updateStatusDeclined(id)
    res.json({status})
})

function emailSenderFunction(target : String, message : String) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: 'did.issuance@gmail.com',
            pass: 'talan2022'
        }
    });
    var mailOptions = {
        from: "did.issuance@gmail.com",
        to: "jlassimahrzia111@gmail.com",
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
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: 'did.issuance@gmail.com',
            pass: 'talan2022'
        }
    });
    var mailOptions = {
        from: "did.issuance@gmail.com",
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
