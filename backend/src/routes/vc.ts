var config = require('../config/config.js');
var nodemailer = require("nodemailer");
var QRCode = require('qrcode')
var express = require('express');
var app = express();
const router = express.Router()
const db = require("../config/db.config.js");

const jwt = require("jsonwebtoken");
const EthereumEncryption = require('ethereum-encryption');

import { EthrDID } from 'ethr-did'


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

// Update status after creating VC
 
const updateStatus = (data: any): any => {
      let ID = data
      console.log(ID)
      let query = "Update vcrequest SET state='1' where did_holder =" + "'" + ID + "'"
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


router.post('/api/issueVC',async(req: any,res: any)=>{ 
    let {formData} = req.body.formData
    let didHolder = formData.id
    let schemaName = req.body.schemaName
    let did = req.body.did
    let privateKey = (req.body.privateKey).substr(2)
    let holder_pubKey = (req.body.holder_pubKey).substr(2)
    console.log(privateKey)
    
    let VerifiableCredential ={ 
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id:'credential/'+result,
        type: ['VerifiableCredential , '  +schemaName],
        issuer:did,
        issuanceDate: (new Date(Date.now())).toISOString(),
        sub:formData.id,
  
        credentialSubject: {},

        proof:""
    }
    let k={}

        Object.keys(formData).map(function(key, index) {
        if(index!==0){
               console.log(key,"****",formData[key],index)

               const hash = EthereumEncryption.hash(formData[key]);
               const signature = EthereumEncryption.signHash(
                privateKey, // privateKey of issuer
                hash // hash
               );
                const k1={"value":formData[key],"proof":signature}
                k={...k,[key]:k1} 
        }   
     

      });
      console.log(k)
      Object.assign( VerifiableCredential.credentialSubject,k)

      const hashVC = EthereumEncryption.hash(JSON.stringify(VerifiableCredential));
      const signatureVC = EthereumEncryption.signHash(
        privateKey, // privateKey of  issuer
        hashVC // hash
        );

    // const valid = EthereumEncryption.verifyHashSignature(
    //     "035a0020899a5059ce2a69a51d32c9e3992a210935f25b8529af9ca11acdc3d350", // publicKey
    //     hashVC, // hash
    //     signatureVC // signature
    // );
    
    // console.log(valid)
 
    VerifiableCredential.proof=signatureVC


    const token = jwt.sign(
        VerifiableCredential ,
        privateKey,
        // private key of issuer
        {
         expiresIn: "1h",
        }
     )

    const encrypted = EthereumEncryption.encryptWithPublicKey(
        holder_pubKey
        , // publicKey of holder
        token // data
    );
    
        
    console.log(VerifiableCredential)
    const status = updateStatus(didHolder)
    res.json({formData})

    const value = JSON.stringify(VerifiableCredential)

    console.log(token)
    // console.log(JSON.parse(value).vc.credentialSubject.name)

    QRCode.toDataURL(encrypted, { type: 'terminal' }, function (err: any, url: any) {
        if (err) return console.log("error occured",err)
        emailSenderFunction('jlassimahrzia111@gmail.com', url);
    })
})



  



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
        to: "jlassimahrzia111@gmail.com",
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