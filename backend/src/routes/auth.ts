
import { computePublicKey } from '@ethersproject/signing-key';
var config = require('../config/config.js');
var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// MySQL
const db = require("../config/db.config.js");

// IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient.create('http://127.0.0.1:5001')

// Contract
const Web3 = require('web3')
const web3 = new Web3('http://127.0.0.1:7545')  
let contract = new web3.eth.Contract(config.ABI_ISSUER_REGISTRY_CONTRACT, config.ISSUER_REGISTRY_CONTRACT_ADDRESS)
let verifiercontract = new web3.eth.Contract(config.ABI_VERIFIER_REGISTRY_CONTRACT, config.RGISTRY_VERIFIER_CONTRACT_ADDRESS)

// send New password to db
const sendAuthCreds = (data : any, data2 : any) : any => {
    let did = data2
    let password = data
    console.log(did)
    bcrypt.hash(password, 10).then(async (hashedPassword : any) => {


        let query = "UPDATE issuers SET password = '" + hashedPassword + "' WHERE did ='" + did + "'"
        return new Promise((resolve, reject) => {

            db.query(query, [
                password, did
            ], (err : any, res : any) => {
                if (err) {
                    console.log("error: ", err);
                    reject(err);
                }
                resolve(res.insertId);
            });
        });
    })
}

const sendAuthCredsVerifier = (data : any, data2 : any) : any => {
    let did = data2
    let password = data
    console.log(did)
    bcrypt.hash(password, 10).then(async (hashedPassword : any) => {


        let query = "UPDATE verifiers SET password = '" + hashedPassword + "' WHERE did ='" + did + "'"
        return new Promise((resolve, reject) => {

            db.query(query, [
                password, did
            ], (err : any, res : any) => {
                if (err) {
                    console.log("error: ", err);
                    reject(err);
                }
                resolve(res.insertId);
            });
        });
    })
}

// login


const login = (data : any, resultat : any) : any => {
    let did = data.did
    let password = data.password


    let query = "SELECT * FROM issuers WHERE did = ? "

    db.query(query, [did], (err : any, res : any) => {
        if (err) {
            console.log("error: ", err);
            resultat.status(500).json({err});
        } else if (res.length > 0) {
            console.log("ok");

            bcrypt.compare(password, res[0].password).then(async (samePassword : any) => {

                if (samePassword) {
                    console.log("ok");

                    const token = jwt.sign({
                        res
                    }, "privateKey", {expiresIn: "1h"})
                    // console.log(token);
                    resultat.status(201).json({token});
                }
                else {
                    resultat.status(404).json("err")
                    console.log("404")
                }
            })

        } else {
            resultat.status(404).json("err")
            console.log("404")
        }

    })

}

const loginVerifier = (data : any, resultat : any) : any => {
    console.log("did",data.did);
    
    let did = data.did
    let password = data.password

    let query = "SELECT * FROM verifiers WHERE did = ? "

    db.query(query, [did], (err : any, res : any) => {
        if (err) {
            console.log("error: ", err);
            resultat.status(500).json({err});
        } else if (res.length > 0) {
            console.log("ok");

            bcrypt.compare(password, res[0].password).then(async (samePassword : any) => {

                if (samePassword) {
                    console.log("ok");

                    const token = jwt.sign({
                        res
                    }, "privateKey", {expiresIn: "1h"})
                    // console.log(token);
                    resultat.status(201).json({token});
                }
                else {
                    resultat.status(404).json("err")
                    console.log("404")
                }
            })

        } else {
            resultat.status(404).json("err")
            console.log("404")
        }

    })

}

const loginAdmin = (data : any, resultat : any) : any => {
  let email = data.email
  let password = data.password


  let query = "SELECT * FROM admin "

  db.query(query, [], (err : any, res : any) => {
      console.log("res",res);
      
      if (err) {
          console.log("error: ", err);
          resultat.status(500).json({err});
      } else if (res.length > 0) {
          console.log("ok");

          bcrypt.compare(password, res[0].password).then(async (samePassword : any) => {

              if (samePassword) {
                  console.log("ok");

                  const token = jwt.sign({
                      res
                  }, "privateKey", {expiresIn: "1h"})
                  // console.log(token);
                  resultat.status(201).json({token});
              }
              else {
                resultat.status(404).json("err")
                console.log("404")
            }
          })

      } else {
          resultat.status(404).json("err")
          console.log("404")
      }

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

/**
 *  Routes
 */


router.post('/api/login', async (req : any, res : any) => {
    let _request = {
        did: req.body.did,
        password: req.body.password
    }
    login(_request, res)
})

router.post('/api/loginVerifier', async (req : any, res : any) => {
    let _request = {
        did: req.body.did,
        password: req.body.password
    }
    loginVerifier(_request, res)
})

router.post('/api/checkPrivateKey', async (req : any, res : any) => {
    let privateKey = req.body.privateKey
    let did = req.body.did
    let publicKey;
    let done;
    try{
        publicKey = computePublicKey(privateKey, true)
    }catch(error){
        done = false
    }
    let ipfshash;
    let ddo ;
    try {
        ipfshash = await contract.methods.getDidToHash(did).call();
        console.log("ipfshash",ipfshash);
        ddo = await resolve(ipfshash)
        console.log("ddo",ddo);
    } catch (error) {
        done = false
    }
    if(ddo.publicKey === publicKey){
        done = true
    }else{
        done = false
    }
    res.json({done})
})


router.post('/api/checkPrivateKeyVerifier', async (req : any, res : any) => {
    let privateKey = req.body.privateKey
    let did = req.body.did
    let publicKey;
    let done;
    try{
        publicKey = computePublicKey(privateKey, true)
    }catch(error){
        done = false
    }
    let ipfshash;
    let ddo ;
    try {
        ipfshash = await verifiercontract.methods.getDidToHash(did).call();
        console.log("ipfshash",ipfshash);
        ddo = await resolve(ipfshash)
        console.log("ddo",ddo);
    } catch (error) {
        done = false
    }
    if(ddo.publicKey === publicKey){
        done = true
    }else{
        done = false
    }
    res.json({done})
})

router.post('/api/loginAdmin', (req : any, res : any) => {
  let _request = {
      did: req.body.email,
      password: req.body.password
  }
  loginAdmin(_request, res)
})

router.post('/api/sendAuthCreds', async (req : any, res : any) => {
    let did = req.body.did
    let password = req.body.password
    console.log(did)
    const id = await sendAuthCreds(password, did)
    console.log(id)
    res.json({id})
})

router.post('/api/sendAuthCredsVerifier', async (req : any, res : any) => {
    let did = req.body.did
    let password = req.body.password
    console.log(did)
    const id = await sendAuthCredsVerifier(password, did)
    console.log(id)
    res.json({id})
})
module.exports = router;
