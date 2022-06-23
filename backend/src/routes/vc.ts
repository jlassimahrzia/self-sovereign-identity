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
            //"0333eec583d04a55ce0aba9dbfb04035e8c6de4f501ecc9b26c08fa501a5ec150748c65fffd671e01fbf2514b9100e73ad6f716fd108c047d9dc5fd00e86e332b560c5d59cdd462b51163a42cdde02cfa5678265fb981fcec2c96fb58085d0ababdf89c767faebee82ddf637ee58da25ea1ccc3ca18dcfca406a321fd2bf01d11e9ea47d87e3112ce17e8a718afc3c98e245f129887454bd5afab0d2edc744be09e2d6805319fa11a7edeed4d877b4e84c914c9ac7b4aba1c1b3c6600123f60c36e59415af47f2b469538799fb7ba437b0c772ffe8d0dfc358b2f109fc110b5dbfd7a0a6f1194458a496923bd0a673f1d25eabd10242fc75934aad1dcbeab78437be0630776779e5f81bfa37410f264af5dcc7945192e2774730940d5416f73fd2ac9fe40e9535f02f834ad27937e2fff9909e6b5eec0936a9a38e809e057e21788d7dde86033e970b0eba11dbfb8c721cc93357c2eab1ed7f2f72a9a992cbc3dd103a5e89cca13ca2e3e114d4f16e11a029988ac257ab4537dfd61bcadaee6c9cdffe9957271bad6343bb73f624393c93f545607786ccc6fa34a08fec092fccac551aa11910f50ae638b2525145d7726dd11182c678ae649ff29431812dc75c04f91c977398c07ad28d0e0f8f89973850f21f94f2aeb3d01bf1bed1effee52125b4dd4858aa832a1cd59e1e53519b2ff9ecb13889b548ab64557e11c98264adfeaa4b4e331b3ff2b9ece1b3f95f84175b485189fa725f3626094e605761106b0dff782d06c73f65d99ac52c1e9451ed9b4711229653f59fa4893e0025ae70e7e1b650379bbca6d6d26d4f815b6e10eee16fe3fff1f000b86994262b9f1def13ad9340546bd30cc0d1b12a3886e508f61c633bd81f4d24e96b8ee9046d362e74ee01f81045dc4e69ac30ef8f718892b4728d0ec91c784713c1ff746357029038f01fe9601116c8083002d1077e5abfd007646588bca6aa805d1c4aad3c093f3574d544583a5a4683b1ccffb86456694d4896a4b495efe065f82ec1310a655cdb2534de39d92cacc4a1dd1f46360241f898302cd6817df23f1a926fac57febb7f1c26f8a855f1345fb432a44dae3fa7faadf43360ee17dce1881fcfcbf2e5570d4b294f5a3b020b6c8fb6f8e50530bb6c3027b1fe79dbb96f7caa1cec5e982aee8d"
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
