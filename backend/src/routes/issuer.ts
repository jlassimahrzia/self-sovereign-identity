
var config = require('../config/config.js');
var express = require('express');
var app = express();
const router = express.Router()
import { Wallet } from '@ethersproject/wallet'
import { computeAddress } from '@ethersproject/transactions'
import { computePublicKey } from '@ethersproject/signing-key'
// import  'buffer';
const Blob = require('buffer')
import PDFDocument from 'pdfkit'
import fs from 'fs'
  

var nodemailer = require("nodemailer");
var QRCode = require('qrcode')
const multer = require('multer')
const path = require('path')
const cors = require("cors");
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
var fileUpload = require('express-fileupload')

let base64Img = require('base64-img');

// IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient.create('http://127.0.0.1:5001')

// Contract
const Web3 = require('web3')
const web3 = new Web3('http://127.0.0.1:7545')  
let contract = new web3.eth.Contract(config.ABI_ISSUER_REGISTRY_CONTRACT, config.ISSUER_REGISTRY_CONTRACT_ADDRESS)

// MySQL
const db = require("../config/db.config.js");


app.use(fileUpload());
app.use(cors());
app.use(express.static("./public"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//! Use of Multer

//@type   POST
//route for post data


// router.post("/upload", upload.single('file'), (req: { file: { filename: string; }; }, res: any) => {
  
//     if (!req.file) {
//         console.log("No file upload");
//     } else {
//         console.log(req.file.filename)
//         var imgsrc = 'http://127.0.0.1:3000/images/' + req.file.filename
//         var insertData = "INSERT INTO issuers(logo)VALUES(?)"
//         db.query(insertData, [imgsrc], (err: any, result: any) => {
//             if (err) throw err
//             console.log("file uploaded")
//         })
//     }
// });





// Types
export type KeyPair = {
    address: string
    privateKey: string
    publicKey: string
}

export interface DidDocument {
    '@context': string | string[]
    '@type': string // Citizen / Organization
    id: string
    publicKey: string
    email: string
    name: string 
    category: string
    updated?: string
    created?: string
}

  
/**
 *  1- createKeyPair
 */

 const createKeyPair = (): KeyPair => {
    const wallet = Wallet.createRandom()
    const privateKey = wallet.privateKey
    const address = computeAddress(privateKey)
    const publicKey = computePublicKey(privateKey, true)
    return { address, privateKey, publicKey }
}

/**
 *  2- Request DID from did issuer
 */
const sendIssuerRequest = (data : any) : any => {

   let query = "INSERT INTO issuers (category, name, email,phone, domain, website, dateCreation,description,location, logo, file) VALUES (?,?,?,?,?,?,?,?,?,?,?);"
    
    return new Promise((resolve, reject) => {
        db.query( query, [ data.category, data.name, data.email,data.phone, data.domain, data.website,  data.dateCreation, data.description,data.location,data.logo, data.file] , (err : any, res : any) => {
           if (err) {
              console.log("error: ", err);
              reject(err);
            }
            resolve(res.insertId);
        });
    });
}


// Update issuers db by adding did 
const UpdateIssuer = (data : any,data2:any, data3:any,data4:any) : any => { 
    let identifier = data
    let publicKey = data2 
    let address = data3
    let id = data4
    let query = "UPDATE issuers SET did='" + identifier + "' , publicKey ='" + publicKey + "' , address ='" + address + "' WHERE id=" + id 
    return new Promise(() => {
        db.query( query, [identifier, publicKey, address, id] ) 
        
    });
}


/**
 *  3- Get Issuer list requests
 */

const getIssuersList = () : any => {
    let query = "SELECT * FROM issuers"
    return new Promise((resolve, reject) => {
        db.query(query, (err: any, res: any) => {
            if (err) {
                console.log("error: ", err);
                reject(err);
            }
            resolve(res);
        });
    });
}

const getIssuersByDid = (did : string) : any => {
    let query = 'SELECT * FROM issuers WHERE did = ? '
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


const updateStatus = (data: any): any => {
    let ID = data
    console.log(ID)
    let query = "Update issuers SET state='1' where id =" + ID
    return new Promise(() => {
        db.query(query, [ID])
    })
}

const updateStatusDeclined = (data: any): any => {
    let ID = data
    console.log(ID)
    let query = "Update issuers SET state='2' where id =" + ID
    return new Promise(() => {
        db.query(query, [ID])
    })
}

/**
 *  4- Generate DID
 */

const generateDID = (publicKey: string): string => {
    return `did:exemple:${publicKey}`
}

/**
 * 5- Create an Identity Document containing the Public Key
 */

const createDDO = (identifier: string, publicKey: string, email: string,name:string,category:string): DidDocument => {
    return {
        '@context': 'https://w3id.org/did/v1',
        '@type': 'Organization',
        id: identifier,
        publicKey: publicKey,
        email: email,
        name: name, 
        category: category,
        created: (new Date(Date.now())).toISOString()
    } 
};


/**
 * 6- Publish Identity Document to IPFS
*/

const pushDDO_ipfs = async (_ddo: DidDocument): Promise<String> => {
    const cid = await ipfs.add(JSON.stringify(_ddo))
    return cid
} 

/**
 * Resolve ddo
 */

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

router.get('/api/createKeyPair', (req : any , res : any) => {
    let _keypair: KeyPair
    _keypair = createKeyPair()
    res.json({_keypair})
})


var storage = multer.diskStorage({
    destination: (req: any, file: any, callBack: (arg0: any, arg1: string) => void) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req: any, file:any, callBack: (arg0: any, arg1: string) => void) => {
        callBack(null, file.fieldname + '-' + Date.now() )
    }
})
 
var upload = multer({
    storage: storage
});

router.post('/api/IssuerRequest', upload.single('file') ,async(req:any , res : any) => {
    //console.log(req.body)
    let _request = {  
        name: req.body.name,
        category: req.body.category,
        domain:req.body.domain, 
        dateCreation:req.body.dateCreation, 
        website:req.body.website,
        description:req.body.description, 
        location:req.body.location,
        email: req.body.email,
        phone:req.body.phone,
        logo: req.body.fileName, 
        file: 'aa'
    }
    const id = await sendIssuerRequest(_request)
    //console.log(id)
    res.json({id})
})

router.get('/api/IssuerRequestList', async (req : any , res : any) => {
    const list = await getIssuersList()
    res.json({list})
})

router.post('/api/IssuerByDID', async (req : any , res : any) => {
    let did = req.body.did
    const list = await getIssuersByDid(did)
    res.json({list})
})

// Ethereum tx registring ipfs hash 
router.post('/api/mappingDidToHashIssuer', async (req : any , res : any) => {
    let _cid = req.body.cid
    let _did = req.body.did
    let accounts = await web3.eth.getAccounts()
    const result = await contract.methods.setDidToHash(_did,_cid).send({from: accounts[0],
        gas:3000000});
    res.json({result}) 
}) 



// Resolve DID 
router.post('/api/resolveIssuer', async (req : any , res : any) => {
    let did = req.body.did
    console.log(did)
    const ipfshash = await contract.methods.getDidToHash(did).call();
    console.log("hash",ipfshash)
    let ddo = await resolve(ipfshash)
    res.json({ipfshash,ddo}) 
}) 




router.post('/api/createIssuer',async (req : any , res : any) => {


    // let publickey = req.body.publickey
    let email = req.body.email
    let name = req.body.name 
    let category = req.body.category
    let id = req.body.id
    let domain = req.body.domain
    let date = req.body.date 
    let website = req.body.website 
    let phone = req.body.phone

    
    // generate wallet
    let _keypair: KeyPair
    _keypair = createKeyPair()
    let publickey = _keypair.publicKey
    let address = _keypair.address
    let privateKey = _keypair.privateKey

    // 1- generateDID
    const identifier = generateDID(publickey)
    // 2- Generate did doc
    const ddo = createDDO(identifier, publickey, email,name,category)
    // 3- add did doc to ipfs and get the cid
    const cid = await pushDDO_ipfs(ddo)
    
    //console.log("cid",cid)
    // 4 - update status il
    const status = updateStatus(id)



    UpdateIssuer(identifier, publickey, address, id)


    // 5 - send qr code 
    // QRCode.toDataURL(identifier, { type: 'terminal' }, function (err: any, url: any) {
    //     if (err) return console.log("error occured")
    //     emailSenderFunction(email, url);
    // })
    var characters = '0123456789';
    var charactersLength = characters.length;
    let result="";
    for (var i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    const token = jwt.sign(
       
     { identifier,result,},'d8b595680851765f38ea5405129244ba3cbad84467d190859f4c8b20c1ff6c75',
       {
         expiresIn: "1h",
       }
     )
       

        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream('C:/Users/ASUS/OneDrive/Bureau/PFE_SSI/backend/public/files/example.pdf'));

        doc.image('C:/Users/ASUS/OneDrive/Bureau/PFE_SSI/backend/public/images/argon-react.png', {
            fit: [120, 120],
            align: 'center',
            valign: 'center', 
            
        })
        .text("Organization")
        .text(name)
        doc.moveTo(500, 200)
        .text("Your DID has been approved, these are your credentials", 80, 300)
        .text("address")
        .text(address)
        .text("Private Key")
        .text(privateKey)
        .text("Public Key")
        .text(publickey)
        .end();

    emailSenderFunction(email, "http://localhost:3000/auth/password/"+token,result,identifier,doc);
  
    res.json({ identifier, cid, status })
})

router.post('/api/createIssuerFailed', async (req: any, res: any) => {
    let email = req.body.email
    let id = req.body.id
    emailSenderFailure(email)
    const status = updateStatusDeclined(id)
    res.json({ status })
})


// Email function when success 
function emailSenderFunction(target: String, message: String,numero: String,identifier:String,doc:any) {
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
        attachments: [{
            filename: 'KeyFileStore.pdf',
            path: 'C:/Users/ASUS/OneDrive/Bureau/PFE_SSI/backend/public/files/example.pdf',
            contentType: 'application/pdf'
          }],

        html:
            "<h4>Your DID request as a trusted organization has been approved. <h4>Decentralized IDentifier (did):"+identifier+"</h4> </h4><br><h4>Use this link to login with the following code</h4><br>" + message + "<br>"+numero
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
        subject: "DID Issuance Request Declined",
        text: "DID Issuance Request Declined",
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

const getImage = (path: String) : any => {
    let image = `public/${path}`
    
    let imageData1 = base64Img.base64Sync(image);
    let base64Data = imageData1.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    let img = Buffer.from(base64Data, 'base64');

    return img
}

router.get('/api/issuersList', async (req : any , res : any) => {
    const list = await getIssuersList()
    res.json({list})
})

router.get('/api/image/:path', async (req : any , res : any) => {
    let path = req.params.path
    let img = getImage(path)
    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length
    });
    res.end(img);
})

module.exports = router;

