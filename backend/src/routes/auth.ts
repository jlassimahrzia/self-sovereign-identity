var config = require('../config/config.js');
var express = require('express');
var app = express();
const router = express.Router()
const jwt = require("jsonwebtoken");
var mysql = require('mysql');


// MySQL
const db = require("../config/db.config.js");


// send New password to db 
const sendAuthCreds = (data:any):any=>{ 
    let query = "INSERT INTO authcreds (did,password) VALUES (?, ?);"
    return new Promise((resolve, reject) => { 

        db.query( query, [ data.did, data.password ] , (err : any, res : any) => {
            if (err) {
              console.log("error: ", err);
              reject(err);
            }
            resolve(res.insertId);
        });
    });
}

//login 


const login=(data:any,resultat:any):any=>{ 
    let did = data.did 
    let password = data.password  
    let query = "SELECT * FROM authcreds WHERE did = ? AND password = ?"
    
    db.query(query,[did,password],(err:any,res:any)=> {
    if (err) {console.log("error: ", err);
    resultat.status(500).json({ err });
        }

    else
    
    if (res.length>0)
    {console.log("ok");
    let query = "SELECT * from issuers WHERE did=?"
    db.query(query,[did],(err:any,res:any)=>{ 
        const  token = jwt.sign(
            { res},
            "privateKey",
            {
              expiresIn: "1h",
            }
          )
        resultat.status(201).json({ token });
    })
   
    }
    else {resultat.status(404).json("err") 
    console.log("404")}
})}

/**
 *  Routes
 */

router.post('/api/login',async(req:any,res:any)=>{ 
    let _request = {
    did : req.body.did ,
    password : req.body.password
    }
 login(_request,res)

})




 router.post('/api/sendAuthCreds', async (req : any , res : any) => {
 let _request = {
    did : req.body.did,
    password: req.body.password
}
const id = await sendAuthCreds(_request)
console.log(id)
res.json({id})
})

module.exports = router;

