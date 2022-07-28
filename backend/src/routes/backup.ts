var express = require('express');
var router = express.Router()

// MySQL
var db = require("../config/db.config.js");

const { split, join } = require('shamir');
const { randomBytes } = require('crypto');
 
const PARTS = 5;
const QUORUM = 3;

const split1 = () : Array<string> => {
    const secret = '0x2a5356712845627742d9c7fef4f6567cb3f13f2764115701752bfbfa3ea59c93';
    // you can use any polyfill to covert string to Uint8Array
    const utf8Encoder = new TextEncoder();
    const secretBytes = utf8Encoder.encode(secret);
    console.log(randomBytes);
    
    // parts is a object whos keys are the part number and values are an Uint8Array
    const parts = split(randomBytes, PARTS, QUORUM, secretBytes);

    return parts 
    
}

const join1 = (parts : Array<string>) : string => {
    const utf8Decoder = new TextDecoder();
    // we only need QUORUM of the parts to recover the secret
    delete parts[2];
    delete parts[3];
    delete parts[4];
    // recovered is an Unit8Array
    const recovered = join(parts);
    // prints 'hello there'
    return utf8Decoder.decode(recovered);
}

const sendTrusteeRequest = (data : any ) : any => {

    let query = "INSERT INTO trusteesrequests (did_holder, did_trustee) VALUES (?, ?);"
    
    return new Promise((resolve, reject) => {
        db.query( query, [ data.did_holder, data.did_trustee] , (err : any, res : any) => {
            if (err) {
              console.log("error: ", err);
              reject(err);
            }
            resolve(res.insertId);
        });
    });
}

const getRecoveryNetworkList = (did : string) : any => {
    let query = 'SELECT * FROM trusteesrequests WHERE did_holder = ? ORDER BY state'
    return new Promise((resolve, reject) => {
        db.query(query, [did] ,(err: any, res: any) => {
            if (err) {
                console.log("error: ", err);
                reject(err);
            }
            resolve(res);
        });
    });
}

const getTrusteeRequestList = (did : string) : any => {
    let query = 'SELECT * FROM trusteesrequests WHERE did_trustee = ? ORDER BY state'
    return new Promise((resolve, reject) => {
        db.query(query, [did] ,(err: any, res: any) => {
            if (err) {
                console.log("error: ", err);
                reject(err);
            }
            resolve(res);
        });
    });
}



const AcceptRequest = (id: any): any => {
    
    let query = "Update trusteesrequests SET state='1' where id = ?"
    return new Promise((resolve, reject) => {
        db.query(query, [id] ,(err: any, res: any) => {
            if (err) {
                console.log("error: ", err);
                reject(err);
            }
            resolve(res.affectedRows);
        });
    })
}

const DeclineRequest = (id: any): any => {
    
    let query = "Update trusteesrequests SET state='2' where id = ?" 
    return new Promise((resolve, reject) => {
        db.query(query, [id] ,(err: any, res: any) => {
            if (err) {
                console.log("error: ", err);
                reject(err);
            }
            resolve(res.affectedRows);
        });
    })
}

router.post('/api/acceptTrusteeRequest', async (req : any , res : any) => {
    
    let id = req.body.id
    
    let result = await AcceptRequest(id)
     
    res.json({result})
})

router.post('/api/declineTrusteeRequest', async (req : any , res : any) => {
    
    let id = req.body.id
    
    let result = await DeclineRequest(id)
    res.json({result})
})

router.post('/api/trusteeRequestList', async (req : any , res : any) => {
    let did_trustee = req.body.did
    
    let list = await getTrusteeRequestList(did_trustee)
   
    
    res.json({list})
})

router.post('/api/recoveryNetworkList', async (req : any , res : any) => {
    let did_holder = req.body.did
    
    let list = await getRecoveryNetworkList(did_holder)
   
    
    res.json({list})
})


router.post('/api/sendTrusteeRequest', async (req : any , res : any) => {
    let _request = {
        did_holder: req.body.did_holder,
        did_trustee: req.body.did_trustee
    }
    const id = await sendTrusteeRequest(_request)
    res.json({id})
})



router.get('/api/test', (req : any , res : any) => {
    let parts = split1();
    let secret = join1(parts)
    if(secret === '0x2a5356712845627742d9c7fef4f6567cb3f13f2764115701752bfbfa3ea59c93'){
        console.log("done");
    }
    else {
        console.log("fail");
        
    }
    res.json({parts, secret})
})

module.exports = router;