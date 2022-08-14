

const { computePublicKey } = require("@ethersproject/signing-key");

const { computeAddress} = require("@ethersproject/transactions");
var express = require('express')

var router = express.Router()

var config = require('../config/config.js');
// MySQL
var db = require("../config/db.config.js");
// Contract
 Web3 = require('web3')
 web3 = new Web3('http://127.0.0.1:7545')  
let contract1 = new web3.eth.Contract(config.ABI_REGISTRY_CONTRACT, config.RGISTRY_CONTRACT_ADDRESS)

// IPFS
var ipfsClient = require('ipfs-http-client')
var ipfs = ipfsClient.create('http://127.0.0.1:5001')

// Shamir secret sharing
const { split, join } = require('shamir');
const { randomBytes } = require('crypto');
 
// Encryption 
const EthereumEncryption = require('ethereum-encryption');

var nodemailer = require("nodemailer");
var QRCode = require('qrcode')

/**
 * START KEY BACKUP
 */

const acceptedRequestsList = (did_holder : string) : any => {
        let query = 'SELECT * FROM trusteesrequests WHERE did_holder = ? AND state=1'
        return new Promise((resolve, reject) => {
            db.query(query, [did_holder] ,(err: any, res: any) => {
                if (err) {
                    console.log("error: ", err);
                    reject(err);
                }
                resolve(res);
            });
        });
}

const resolve = async (ipfsHash: String)  : Promise<any> => {
    let asyncitr = ipfs.cat(ipfsHash)
    let data 
    for await (const itr of asyncitr) {
        data = Buffer.from(itr).toString()
    } 
    return JSON.parse(data.toString());
}

const split1 = (secret : any, threshold : any , participants : any ) : any => {
    
    const utf8Encoder = new TextEncoder();
    const secretBytes = utf8Encoder.encode(secret);
    const parts = split(randomBytes, participants, threshold, secretBytes);
    
    
    return parts 
    
}

function emailSenderFunction(target : String, message : String, sender : any) {
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
        subject: "Identity TN Trusted Contact from [ "+ sender.firstname + " " + sender.lastname + " ]",
        attachDataUrls: true,
        html: "<h4>Scan the QR code to get a code to help your friend to recover his private key in case of lost. </h4><br> If you get this email, pick up the phone and call your friend before scanning the QR-Code they've shared. <br><img src=" + message + ">"
    };
    transporter.sendMail(mailOptions, function (error : String) {
        if (error) {
            console.log(error);
        }
    });
}

const backupKey =  async (data : any) : Promise<any> => {

    let list1 = await acceptedRequestsList(data.did)

    let ipfshash = await contract1.methods.getDidToHash(data.did).call();
    let holder_ddo = await resolve(ipfshash)

    console.log("1-",list1);
    
    
    let tab : any
    tab = []
    await Promise.all(list1.map( async (element : any) => {
        const ipfshash = await contract1.methods.getDidToHash(element.did_trustee).call();
        let ddo = await resolve(ipfshash)
        let request = {...element, ddo}
        tab.push(request)
    }));
    
    console.log("2-",tab);
   
    const utf8Encoder = new TextEncoder();
    const secretBytes = utf8Encoder.encode("0x23a4608947366e9b0ad99d88a5fc4b623617f908a3dfdbce47ae99be0e8ca1c9");
    let fragments = split(randomBytes, list1.length, data.threshold, secretBytes);
    
    console.log("2-",fragments);
    
    let paquets : any
    paquets = []

    for (let index = 0; index < list1.length; index++) {
        console.log(index);
        
        let tabfragment = Object.values(fragments);
        console.log(fragments[index]);
        let hash = EthereumEncryption.hash(JSON.stringify(tabfragment[index]))
        
        let signature = EthereumEncryption.signHash(
            (data.privateKey).substr(2), 
            hash
        );

        let paquet = { [index+1]: tabfragment[index], "proof": {hash: hash , signature : signature}, idRequest : tab[index].id}

        paquets.push(paquet)
        
    }

    console.log("1- fragments", paquets);
    
    let encryptedFragments : any
    encryptedFragments = []
    
    for (let index = 0; index < tab.length; index++) {
        
        const encrypted = EthereumEncryption.encryptWithPublicKey(
            (tab[index].ddo.publicKey).substr(2), // publicKey of holder
            JSON.stringify(paquets[index]) // data
        );
        encryptedFragments[index] = encrypted
    }

    console.log("2- encryptedFragments", encryptedFragments);

    for (let index = 0; index < tab.length; index++) {
        console.log(index);
        
        let encrypted = encryptedFragments[index];
        QRCode.toDataURL(JSON.stringify(encrypted), {
            type: 'terminal',
            width: '500',
            errorCorrectionLevel: 'M'
        }, function (err : any, url : any) {
            if (err) 
                return console.log("error occured", err)
            emailSenderFunction(tab[index].ddo.email, url, holder_ddo);
        }) 
        
    } 

    return true
}

router.post('/api/backupKey', async (req : any , res : any) => {
    let done = false

    let data = {
        did: req.body.did,
        privateKey: req.body.privateKey,
        threshold: req.body.threshold
    }
    
    console.log(data);
    
    done = await backupKey(data)
    
    
    res.send({done})
})

/**
 * END KEY BACKUP
 */

/**
 * START KEY RECOVERY
 */

const recoverKey =  async (fragments : any) : Promise<any> => {
    let parts = {}
    

    let list :any
    list = []

    fragments.forEach((element : any) => {
        let item = JSON.parse(element.fragment)
        list.push(JSON.parse(item))
    });

    
    console.log(list);
    

    list.forEach( (fragment : any) => {
        
        parts = {...parts, [Object.keys(fragment)[0]] : Object.values(fragment[Object.keys(fragment)[0]])}
    });
    
    const utf8Decoder = new TextDecoder();
    const recovered = join(parts);
    let secret = utf8Decoder.decode(recovered);
    
    
    
    if(secret.includes("\\")){
        
        
        const result = await Promise.resolve({
            test : false,
            msg : "You have to collect more fragments."
        });

        return result

    }
    else {
        
        
        let valid

        let publicKey : any
        publicKey = computePublicKey(secret, true)
        
        list.forEach( async (element : any) => {
                
            
            try {
                valid = EthereumEncryption.verifyHashSignature(
                    publicKey.substr(2), // publicKey
                    element.proof.hash , // hash
                    element.proof.signature // signature
                );
            } catch (error) {
                const result = await Promise.resolve({
                    msg : "Fragment signature Not Valid",
                    test : false
                });
                return result;
            }
            if(!valid){
                console.log("valid",valid);
                
                const result = await Promise.resolve({
                    msg : "Fragment signature Not Valid",
                    test : false
                });
                return result;
            } 
        });
        
    } 

    
    const address = computeAddress(secret)
    const publicKey = computePublicKey(secret, true)
    const did = `did:exemple:${publicKey}`

    const ipfshash = await contract1.methods.getDidToHash(did).call();
    let ddo = await resolve(ipfshash)

    const result = await Promise.resolve({
        test : true,
        identity : { address : address, privateKey : secret , publicKey : publicKey , did : did },
        profile : ddo
    });
    
    return result 
}

router.post('/api/recoverKey', async (req : any , res : any) => {
    let fragments = req.body.fragments
    
    
    let result = await recoverKey(fragments)
    
    res.json({result})
})
 
const getRequestById = (id: any) => {
    let query = 'SELECT * FROM trusteesrequests WHERE id = ?'
        return new Promise((resolve, reject) => {
            db.query(query, [id] ,(err: any, res: any) => {
                if (err) {
                    console.log("error: ", err);
                    reject(err);
                }
                resolve(res);
            });
        });
}

const decryptFragment = async (encrypted : any, privateKey : any) : Promise<any> => {
    
    let decrypted ;
   
    
    try{
        
        decrypted = EthereumEncryption.decryptWithPrivateKey(
            privateKey.substr(2), // privateKey
            encrypted
        );
    }catch(error){
        console.log("error",error); 
        const result = await Promise.resolve({
            msg : "Fragment encryption not valid",
            test : false
        });
        return result;
    }
    decrypted = JSON.parse(decrypted)
    
    let request : any
    request = await getRequestById(decrypted.idRequest)
    
    
    // Resolve Issuer ddo      
    const ipfshash = await contract1.methods.getDidToHash(request[0].did_holder).call();
    const ddo = await resolve(ipfshash)
    
    
    let valid
    try {
        valid = EthereumEncryption.verifyHashSignature(
            ddo.publicKey.substr(2), // publicKey
            decrypted.proof.hash , // hash
            decrypted.proof.signature // signature
        );
    } catch (error) {
        const result = await Promise.resolve({
            msg : "Fragment signature Not Valid",
            test : false
        });
        return result;
    }
    if(!valid){
        console.log("valid",valid);
        
        const result = await Promise.resolve({
            msg : "Fragment signature Not Valid",
            test : false
        });
        return result;
    } 
    
    const result = await Promise.resolve({
        test : true,
        decrypted : decrypted
    });
    return result;
    
}

const sendFragmentByEmail = (target : any, sender : any, message : any)  => {
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
        subject: "Identity TN - Fragment sended from [ "+ sender.firstname + " " + sender.lastname + " ]",
        attachDataUrls: true,
        html: "<h4>Scan the QR code to get the fragment from [ "+ sender.firstname + " " + sender.lastname + " ]. </h4><br> If you get this email, pick up the phone and call your friend before scanning the QR-Code they've shared. <br><img src=" + message + ">"
    };
    transporter.sendMail(mailOptions, function (error : String) {
        if (error) {
            console.log(error);
        }
    });
}

router.post('/api/sendFragment', async (req : any , res : any) => {
    let done = false
    let did_holder = req.body.did_holder
    let fragment = req.body.fragment
    
    try {
        const ipfshash = await contract1.methods.getDidToHash(did_holder).call();
        const ddo = await resolve(ipfshash)

        QRCode.toDataURL(JSON.stringify(fragment), {
            type: 'terminal',
            width: '500',
            errorCorrectionLevel: 'M'
        }, function (err : any, url : any) {
            if (err) 
                return console.log("error occured", err)
            sendFragmentByEmail(ddo.email, ddo, url);
        })

        done = true
    } catch (error) {
        
    }
    

    res.json({done})
})

router.post('/api/decryptFragment', async (req : any , res : any) => {
    let privateKey = req.body.privateKey
    let encrypted = req.body.encrypted
    console.log(encrypted);
    console.log(privateKey);


    let result = await decryptFragment(encrypted, privateKey)
    
    res.json({result})
})

/**
 * END KEY RECOVERY
 */

const join1 = (parts : any) : string => {
    const utf8Decoder = new TextDecoder();
    const recovered = join(parts);
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



 router.post('/api/test', (req : any , res : any) => {
 
    const utf8Decoder = new TextDecoder();
   
    const recovered = join(req.body.parts);
    let result = utf8Decoder.decode(recovered)
    if(result === '0x2a5356712845627742d9c7fef4f6567cb3f13f2764115701752bfbfa3ea59c93'){
        console.log("done");
    }
    else {
        console.log("fail");
        
    }
    res.json({result})
})

router.get('/api/test2', (req : any , res : any) => {
    let secret = '0x2a5356712845627742d9c7fef4f6567cb3f13f2764115701752bfbfa3ea59c93'
    const utf8Encoder = new TextEncoder();
    const utf8Decoder = new TextDecoder();
    const secretBytes = utf8Encoder.encode(secret);
    // parts is a object whos keys are the part number and values are an Uint8Array
    const parts = split(randomBytes, 10, 5, secretBytes);
    console.log(parts);
    
   // recovered is an Unit8Array
    const recovered = join(parts);
    let result = utf8Decoder.decode(recovered)
    
    console.log(result);
    //return result;
    
    // if(result === '0x2a5356712845627742d9c7fef4f6567cb3f13f2764115701752bfbfa3ea59c93'){
    //     console.log("done");
    // }
    // else {
    //     console.log("fail");
        
    // } 
    // res.json({parts})
}) 

router.post('/api/test3', (req : any , res : any) => {
    let parts = req.body
    //res.json(parts);
    const utf8Decoder = new TextDecoder();
    // delete parts[2];
    // delete parts[3];
    const recovered = join(parts);
    //res.json(recovered);
    //res.json({ recovered});
   
    let result = utf8Decoder.decode(recovered)
    console.log(result);
     res.json({ result});
    // if(result === '0x2a5356712845627742d9c7fef4f6567cb3f13f2764115701752bfbfa3ea59c93'){
    //     console.log("done");
    // }
    // else {
    //     console.log("fail");
        
    // }
    // res.json({ result})
}) 
module.exports = router;