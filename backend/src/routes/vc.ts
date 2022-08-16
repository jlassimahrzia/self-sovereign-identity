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

    console.log("VerifiableCredential : ",VerifiableCredential);
    

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

    console.log("qrcodeData",qrcodeData);
    

   /*  QRCode.toDataURL(JSON.stringify(qrcodeData), {
        type: 'terminal',
        width: '500',
        errorCorrectionLevel: 'M'
    }, function (err : any, url : any) {
        if (err) 
            return console.log("error occured", err)
        emailSenderFunction(ddo.email, url);
    })  */
    res.json({done : true, qrcodeData: qrcodeData})
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
            //'0333eec583d04a55ce0aba9dbfb04035e8c6de4f501ecc9b26c08fa501a5ec1507e05518776f305c3e664d119522483884d80b4fec3ff4fbadc546e3a37fe189d35220eaeb1715fe4d4170b06a6d1494768442235be8e9584537bec968c37e93dbb577db4ec085b400631f93ac0b8daab8df77ac7a1cedbe516557d9bacaa1cae6cfd8a04ecf2b92b8dc4fd9da03fe7d53d55e6e724f6cc38018c3f387bca40a9a9018db3af12fec90b964a128e096151907d6b1beed4e22464d6396b99e7037a2dbb13502f7bcd1d74e7b2c979150c8296df422b7e5ec6aef9121a2bb1c952646b29900e19e3dce9247a92e839e4fd006ebd7e3fd27017ba4cd36d504a113f77c3b128d5c1af0ca36eeb5638a5fb0097a9820511d63be9d0bdb31a42f08a4d9f3fb4e5a41b913a45daf610a6c1b4b8f2c276981c483517517e34b883440a2cbc72f93340e96f604bd2dd4da079854e7081e0ab7a7d32fe1d5f03b459059e500d9799fda06be31820e9d339f80e77e5be4e5775d0b2abe17048254d6f1b39d9ce7b70debfd892fddbf1de45d0ef27d9370a2e0f4876d312964b4416ac934f3c6a38d966d3e0f80e9f61ccd1fdc8f3e6f8d2533549732c68a548fae227b9663bf71c37a96dbb50191ab4148c35be8baae7bc017391359fc13ccb9510c216ddf40f3bc7d1eb6dcaa1bf5312a2f8a245396214fa5a4ec71f972e04070a25d15b37e1f950554539490b4684f893a100de216c443655f7f3b528fe4820c8a0445e8e6790a09be39ed9f4c27527662fee0ed169d3d3a1b6e83b179a1be200cebe4aba97abbd183919270fe1b829c2edb67112abd7cb55815091ff03f1caf5ec696be2bb109d1e411f845030a91f28342cf2be16fd69b6b858599c41d5f952e1aab19c4de4830b646a8cdaf43ffe18de7b7ec48b94b8a3b1c69c7bf2c0995faaafa75eb13c280b02c7f1ee5c94aea235f71c4eaf3d061df1f308afa518fb8be4465ea4e482854b6c512a8304129c23475648a4cea0bc11963ff483866dacd22baaa44a48b4b0815521b9b7db2f8792aa2b5a8eb2cc8a6abbc92b9937351df9d60f8f98a987845167cdd0b915527a06d1b8f9bc5a90bbd64970dc63242ca930a0208389b3d1fd6a33f2238e265931ad5d2df4322aba6997f6be83617a10f3042ae312e62143b6581c51a52acdacf87f01cb5cc6756cfc5f5477b889fa90f1179cfd66bd06b7329acbff1c51c9ced6e641c2c62f3b362705c2903c3be08afd1f0db73926fcbfed2b8041b7e10f789c32871bc74c9e0db10f747b75833b83933cb757c06688b1978f2c98207f13eae7e18d7d896f3fb760b337273b65895808d1829dfd226cc3713ffe4d668b3ce9b3e72d309cf05472ef67f1cd22082dab590933c5e6bda3332746b3a5308cd31745c1c17976ad0d1ca49381b30e25249cf8231e19b0ee32b7f6e866d2b9238df3977f28ee7e8e302'
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
    console.log(result);
    
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
