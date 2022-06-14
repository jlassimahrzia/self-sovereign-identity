export {};
var express = require('express');
var app = express();
var router = express.Router();
var config = require('../config/config.js');

// IPFS
var ipfsClient = require('ipfs-http-client')
var ipfs = ipfsClient.create('http://127.0.0.1:5001')

// Contract
const Web3 = require('web3')
const web3 = new Web3('http://127.0.0.1:7545') 
let contract = new web3.eth.Contract(config.ABI_VP_SCHEMA_REGISTRY_CONTRACT, config.VP_SCHEMA_VERIFIER_CONTRACT_ADDRESS)

/* 1-
On ajoute ce objet à verifiable presentation base schema
"verifiableCredential" > "items" = []
{
 "title" : "schema name",
 "issuer": "issuer DID",
 "description" : "schema description",
 "properties": {
    "credentialSubject": {
        "properties": {
            "id": {
            "description": "Defines the DID of the subject that is described by the Verifiable Credential",
            "type": "string",
            "format": "uri"
            },
            "familyName": {
            "description": "Defines current family name(s) of the credential subject",
            "type": "string"
            },
            "firstName": {
            "description": "Defines current first name(s) of the credential subject",
            "type": "string"
            }
        },
        "required": [
            "id"
        ]  
    }
  }
} 
2- Add vp schema to blockchain ipfs mapping ( did verifier , [ vp schemas ])
*/

const setVerifiableCredential = (title: string, issuer: string ,description:string, items: object, tab: Array<string>) : any => {

    let baseschema = require("../config/vpItem.json")
    let vc_baseschema = JSON.parse(JSON.stringify(baseschema)); 
 
    vc_baseschema.title = title
    vc_baseschema.description = description
    vc_baseschema.issuer = issuer
    tab.forEach(element => {
        vc_baseschema.properties.credentialSubject.required.push(element)
    });

    for (const [key, value] of Object.entries(items)) {
        if(value.format){
            vc_baseschema.properties.credentialSubject.properties = {
                ...vc_baseschema.properties.credentialSubject.properties,
                [key]: {
                    "description": `${value.description}`,
                    "type": `${value.type}`,
                    "format": `${value.format}`
                }
            } 
        }
        else{
            vc_baseschema.properties.credentialSubject.properties = {
                ...vc_baseschema.properties.credentialSubject.properties,
                [key]: {
                    "description": `${value.description}`,
                    "type": `${value.type}`
                }
            }  
        }
    }

    return vc_baseschema
}

const setVpItems = (data: any) => {
    let vp_baseschema = require("../config/verifiablePresentation.json")
    let Vpbaseschema = JSON.parse(JSON.stringify(vp_baseschema)); 

    Vpbaseschema.title = data.title 
    Vpbaseschema.description = data.description 
    
    Vpbaseschema.properties.verifiableCredential.items.pop()
    for (let index = 0; index < data.tabVC.length; index++) {
        let vc_schema = setVerifiableCredential(data.tabVC[index].title, data.tabVC[index].issuer, data.tabVC[index].description, data.tabVC[index].items, data.tabVC[index].required)
        Vpbaseschema.properties.verifiableCredential.items.push(vc_schema)
    }

    return Vpbaseschema
}

router.post('/api/createVpSchema', async (req : any , res : any) => {
    let did = req.body.did
    let data = req.body.data
    
    
    let vpSchema = setVpItems(data)

    res.json({vpSchema})
})

module.exports = router;