var config = require('../config/config.js');
const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");
var nodemailer = require("nodemailer");
var QRCode = require('qrcode')
var express = require('express');
var app = express();
const router = express.Router()
const db = require("../config/db.config.js");
const crypto = require("crypto")
const jwt = require("jsonwebtoken");
var fs = require('fs');

import { EthrDID } from 'ethr-did'
import { Issuer } from 'did-jwt-vc'
import { JwtCredentialPayload, createVerifiableCredentialJwt } from 'did-jwt-vc'

// Request vc from issuer

const sendVCRequest = (data: any): any => {
  let did_holder = data.did_holder
  let did_issuer = data.did_issuer
  let vc_name = data.vc_name

  let query = "INSERT INTO vcrequest (did_holder, did_issuer, vc_name) VALUES (?,?,?);"

  return new Promise((resolve, reject) => {
      db.query(query, [did_holder, did_issuer, vc_name], (err: any, res: any) => {
          if (err) {
              console.log("error: ", err);
              reject(err);
          }
          resolve(res.insertId);
      });
  });

}


//Get VC creation requests

const getVCRequestList = (data:any): any => {
    let didIssuer = data
   
  let query = "SELECT * FROM vcrequest WHERE did_issuer= '" + didIssuer+ "'"
  return new Promise((resolve, reject) => {
      db.query(query,[didIssuer], (err: any, res: any) => {
          if (err) {
              console.log("error: ", err);
              reject(err);
          }
          resolve(res);
      });
  });
}



//Cloud Azure Key Vault 
/* const credential = new DefaultAzureCredential();  
const url = "https://issuerkeypairs.vault.azure.net/";
const client = new SecretClient(url, credential); */


//Exporting Keys from Azure
/* const exportPublicKey = async (): Promise<string> => {
    const publicKey = await (await client.getSecret("publicKey")).value; 
    return publicKey;
}
let publickey="";
exportPublicKey().then(function(result) { 
    publickey = result
    
 })
 const exportPrivateKey = async (): Promise<string> => {
    const secretKey = await (await client.getSecret("secretKey")).value; 
    return secretKey;
}
let secretKey="";
exportPrivateKey().then(function(result) {
  secretKey=result
  console.log(secretKey)
 }) */

const issuer = new EthrDID({
    identifier: '0xf1232f840f3ad7d23fcdaa84d6c66dac24efb198',
    privateKey: 'd8b595680851765f38ea5405129244ba3cbad84467d190859f4c8b20c1ff6c75'
}) as Issuer

 // Update status after creating VC
 
  
const updateStatus = (data: any): any => {
      let ID = data
      console.log(ID)
      let query = "Update vcrequest SET state='1' where id =" + ID
      return new Promise(() => {
          db.query(query, [ID])
      })
  }
  
  

  const updateStatusDeclined = (data: any): any => {
      let ID = data
      console.log(ID)
      let query = "Update vcrequest SET state='2' where id =" + ID
      return new Promise(() => {
          db.query(query, [ID])
      })
  }

// const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
//     modulusLength: 550,
//     publicKeyEncoding: {
//       type: "pkcs1",
//       format: "pem",
//     },
//     privateKeyEncoding: {
//       type: "pkcs1",
//       format: "pem",
//     },
//   });

//   fs.writeFileSync("backend/keyFileStore/public.pem", publicKey);
//   fs.writeFileSync("backend/keyFileStore/private.pem", privateKey); 

  
//   fs.readFile('../keyFileStore/private.pem', 'utf8', function(err: any, data: any){
      
//     // Display the file content
//     console.log(data);
// });

// const verifiableData = "this need to be verified";
// const privateKey = require("../keyFileStore/private.pem")
// const publicKey = require("../keyFileStore/public.pem")
// // The signature method takes the data we want to sign, the
// // hashing algorithm, and the padding scheme, and generates
// // a signature in the form of bytes
// const signature = crypto.sign("sha256", Buffer.from(verifiableData), {
//   key: privateKey,
//   padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
// });
// console.log("signature"+signature.toString("base64"));

// const isVerified = crypto.verify(
//     "sha256",
//     Buffer.from(verifiableData),
//     {
//       key: publicKey,
//       padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
//     },
//     signature
//   );
  
//   // isVerified should be `true` if the signature is valid
//   console.log("signature verified: ", isVerified);

router.post('/api/vcRequest', async (req: any, res: any) => {
  let _request = {
    did_holder: req.body.did_holder,
    did_issuer: req.body.did_issuer,
    vc_name: req.body.vc_name
  }
  const id = await sendVCRequest(_request)
  res.json({ id })
})

router.post('/api/vcRequestList', async (req: any, res: any) => {
  let didIssuer = req.body.didIssuer
  const list = await getVCRequestList(didIssuer)
  res.json({ list })
})


var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var charactersLength = characters.length;
let result="";
for (var i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() *
    charactersLength));
}
  
router.post('/api/createVC', (req: any, res: any) => {

    let id = req.body.id
    let did = req.body.did
    let familyName = req.body.familyName
    let firstName = req.body.firstName
    let dateOfBirth = req.body.dateOfBirth 
    let privateKey = req.body.privateKey
    
    let vcPayload: JwtCredentialPayload = {
        sub: did,
        nbf: 1562950282,
        vc: {
            id: 'credential/'+result,
            issuanceDate: (new Date(Date.now())).toISOString(),
        
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential'],
            credentialSubject: {
                degree: {
                    familyName:{ 
                        value: familyName ,  
                    },
                    firstName:{ 
                        value: firstName,
                    },
                    dateOfBirth:{ 
                    value: dateOfBirth,
                    }
                }
            }, 
        }
    }

    Object.keys(req.body).forEach(function (key){
        CreateJWT(key,req.body[key],vcPayload)
    }) 
    
    const vc0 = async (): Promise<string> => {
        const vcJwt = await createVerifiableCredentialJwt(vcPayload, issuer)
        return vcJwt  
    }

        let vcJwt=""
        vc0().then(function(result) { 
           
            vcJwt = result
            console.log(result)
            vcPayload.vc = { ...vcPayload.vc, jwt:vcJwt };

            const status = updateStatus(id)
            res.json( vcPayload)

         })
        const value = JSON.stringify(vcPayload)

    QRCode.toDataURL(value, { type: 'terminal' }, function (err: any, url: any) {
        if (err) return console.log("error occured")
        emailSenderFunction('jlassimahrzia111@gmail.com', url);
    })

})


async function CreateJWT( index: String,  value: String,vcPayload:any) {
    

    console.log(index +" "+value+"\n" )
    

    if(index!=="did"){
        if(index==="familyName"){
            const x={familyName: vcPayload.vc.credentialSubject.degree.familyName}
            const token = jwt.sign(
                 x ,
                 'd8b595680851765f38ea5405129244ba3cbad84467d190859f4c8b20c1ff6c75',
                {
                  expiresIn: "1h",
                }
              )
        
            vcPayload.vc.credentialSubject.degree.familyName= { ...vcPayload.vc.credentialSubject.degree.familyName,proof: token };

           
           }else if(index==="firstName"){
            const x={firstName: vcPayload.vc.credentialSubject.degree.firstName}
            const token = jwt.sign(
                 x ,
                 'd8b595680851765f38ea5405129244ba3cbad84467d190859f4c8b20c1ff6c75',
                {
                  expiresIn: "1h",
                }
              )
              vcPayload.vc.credentialSubject.degree.firstName= { ...vcPayload.vc.credentialSubject.degree.firstName,proof: token };
            }else{
            const x={dateOfBirth: vcPayload.vc.credentialSubject.degree.dateOfBirth}
            const token = jwt.sign(
                 x ,
                 'd8b595680851765f38ea5405129244ba3cbad84467d190859f4c8b20c1ff6c75',
                {
                  expiresIn: "1h",
                }
              )
              vcPayload.vc.credentialSubject.degree.dateOfBirth= { ...vcPayload.vc.credentialSubject.degree.dateOfBirth,proof: token };

        //   }
        
         }}
    

 
}


router.post('/api/createVCFailed', async (req: any, res: any) => {
  let id = req.body.id
  emailSenderFailure('khalfaoui.emnaa@gmail.com')
  const status = updateStatusDeclined(id)
  res.json({ status })
})

function emailSenderFunction(target: String, message: String) {
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
        subject: "DID Issuance",
        attachDataUrls: true,

        html:
            "<h4>Scan the QR code to get your Verifiable credentials. </h4><br><img src=" + message + ">"
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