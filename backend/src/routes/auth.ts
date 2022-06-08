var config = require('../config/config.js');
var express = require('express');
var app = express();
var router = express.Router();
const jwt = require("jsonwebtoken");
var mysql = require('mysql');
const bcrypt = require("bcrypt");


// MySQL
const db = require("../config/db.config.js");


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
          })

      } else {
          resultat.status(404).json("err")
          console.log("404")
      }

  })

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

router.post('/api/loginAdmin', async (req : any, res : any) => {
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

module.exports = router;
