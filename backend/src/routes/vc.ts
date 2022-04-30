var config = require('../config/config.js');
var nodemailer = require("nodemailer");
var QRCode = require('qrcode')
var express = require('express');
var app = express();
const router = express.Router()
const db = require("../config/db.config.js");

export interface VerifiableCredential {
    '@context': string | string[]
    id: string
    '@type': string | string[]
    'issuer': string
    issuanceDate: string
    credentialSubject: {
        did: string
        claims: {
            Type: {
                value: string
                proof: string
            },
            Name: {
                value: string
                proof: string
            },
            Year: {
                value: Number
                proof: string
            }
        }
    }
    proof: string

}

const createVC = (address: string, id: string, type: string, name: string, year: Number, signature_type: string, signature_name: string, signature_year: string, proof: string): VerifiableCredential => {


    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }


    return {
        '@context': 'https://www.w3.org/2018/credentials/v1',
        '@type': ['VerifiableCredential', 'UniversityDegreeCredential'],
        'issuer': 'did:exemple:' + address,
        id: 'credential/' + result,
        issuanceDate: (new Date(Date.now())).toISOString(),
        credentialSubject: {
            did: id,
            claims: {
                Type: {
                    value: type,
                    proof: signature_type
                },
                Name: {
                    value: name,
                    proof: signature_name
                },
                Year: {
                    value: year,
                    proof: signature_year
                }
            }
        },
        proof: proof

    }


}

const saveDID = (x: any): any => {
    let did = x
    let query = "INSERT INTO vc (did) VALUES (?);"


    return new Promise((resolve, reject) => {
        db.query(query, [did], (err: any, res: any) => {
            if (err) {
                console.log("error: ", err);
                reject(err);
            }
            resolve(res);
        });
    });


}

const showUsedDID = (x: any): any => {

    let query = "SELECT * from vc;"


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


router.post('/api/GetDIDs', async (req: any, res: any) => {
    let _request = {
        did: req.body.did,
    }
    const id = await showUsedDID(_request)
    console.log(id)
    res.json({ id })
})


router.post('/api/createVC', (req: any, res: any) => {

    let did = req.body.did
    let address = req.body.address
    let name = req.body.name
    let type = req.body.type
    let year = req.body.year
    let signature_name = req.body.signature_name
    let signature_year = req.body.signature_year
    let signature_type = req.body.signature_type
    let proof = req.body.proof

    const k = saveDID(did)
    console.log(k)
    const x = createVC(address, did, type, signature_type, name, signature_name, year, signature_year, proof)
    const value = JSON.stringify(x)
    console.log(x)
    QRCode.toDataURL(value, { type: 'terminal' }, function (err: any, url: any) {
        if (err) return console.log("error occured")
        emailSenderFunction('jlassimahrzia111@gmail.com', url);
    })
    res.json({ x, k })
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
            "<h4>Scan the QR code to get your Verifiable credential. </h4><br><img src=" + message + ">"
        ,
    };
    transporter.sendMail(mailOptions, function (error: String) {
        if (error) {
            console.log(error);
        }
    });
}
module.exports = router;