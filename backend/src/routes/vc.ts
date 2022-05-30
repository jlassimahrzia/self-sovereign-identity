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


    //console.log("encrypted : ", encrypted)

    
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
        errorCorrectionLevel: 'M' ,
        small: true
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
            "0333eec583d04a55ce0aba9dbfb04035e8c6de4f501ecc9b26c08fa501a5ec150794b6753095dde6fdc4946f7e39884439034f7e577d166ceef3eaaedb80b4b20493ff9fe10559673b036f2b366393dad7825bdbfa13181c3dd819d1b035ffca5d94590ffa703151c44aae6820cf47d44c501807326feacec7ef0e419e947b9bd111f981790f34c6085104597c52751709fc5aa167715b0dcdfdd39ba2a2eef60c0c5305874b5afe64960422968a64bd6465c75af39e0bfa5f484038435d5510fb1c82703ef01c218896fcc8922cd88716463aac14533cdde82494cde0421ce8dacf0fcb996764d3a1240cd07025fa5f321938fd461e39d2b41866315090b3b515c7297cc6bd31272ba1157d2e2a0a63c2e9889703054b64b5a24b55919b2ad8b6b8fbc689900e88a54444de9212d8f744129ea63e68f13ce910a54bb96ca729cb3d68b84e0e933bf833755ce02a0e10e1794315a5de5f1d204c36fcbadc7a7609bb678d1c7eae8962b33aae8137650881725d22964b2d0c7c0c01952890eeddb191c9215f13c24a259adc9ce9e53c712fd08cc6091b9dea18d05d240045f24487e8cb1ef7d04ef8c7fb65d33bf8d739663253ddfc897cb236e9a0fa94ea6a66497f75df92dd16b8db5a97632ea3e74a28df1327e6baf495a01d94589829d100fa2e3a8017fd6492eadfb9b26b9fd234c81fef77c3732cd7c8ff385d69a7390e8255c271bf66ad575119454819565c54224e0b12aa8cb75441478bf447775813fc3ab089af52147d737c410c61896a4344122cd5cbb2936013b5ad238e2334eaced5fb973a1e1bc206acb71feb2702ee7b95a9055f93dd29211a137ca119fc425459d966d15585fbcf4341b1e470702b7c1f1d110068e4fbec80ecc11023c224ebf229f0038dc560706e6c47e8f2abdd3fbed6abde2b8c6aa68c6d550e0f891d46bef49ec2b512c027c834a074f04078546e821e7b542f0b2edc92cf340bf959b96979ce298d83eb252370f32436c4546191d09662ac9b5337db5080e34ff96b1b7c7442b2b8e452eb745e77bb5d45e1d6bd7023346b1af03c7c96b29739a3bab7b40242bcab40c76f444d675f699e6d3bc1e1e24e0d939d7f765a9afadf1e4e9d76c81d4061a268bd2fab4654e74601b8fc6f7fd993bff7928811b65d5e2a7738"
        );
    }catch(error){
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
