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

const setVerifiableCredential = (title : string, issuer : string, claims : Array < Object >) : any => {

    let baseschema = require("../config/vpItem.json")
    let vc_baseschema = JSON.parse(JSON.stringify(baseschema));

    vc_baseschema.title = title
    vc_baseschema.issuer = issuer

    claims.forEach((element : any) => {
        if (element.value.format) {
            vc_baseschema.properties.credentialSubject.properties = {
                ... vc_baseschema.properties.credentialSubject.properties,
                [element.label]: {
                    "description": `${
                        element.value.description
                    }`,
                    "type": `${
                        element.value.type
                    }`,
                    "format": `${
                        element.value.format
                    }`
                }
            }
        } else {
            vc_baseschema.properties.credentialSubject.properties = {
                ... vc_baseschema.properties.credentialSubject.properties,
                [element.label]: {
                    "description": `${
                        element.value.description
                    }`,
                    "type": `${
                        element.value.type
                    }`
                }
            }
        }
    });

    return vc_baseschema
}

const setVpItems = (data : any) => {
    let vp_baseschema = require("../config/verifiablePresentation.json")
    let Vpbaseschema = JSON.parse(JSON.stringify(vp_baseschema));

    Vpbaseschema.title = data.title
    Vpbaseschema.description = data.description

    Vpbaseschema.properties.verifiableCredential.items.pop()
    for (let index = 0; index < data.numberOfCredentials; index++) {
        let vc_schema = setVerifiableCredential(data.credentiels[index].credential, data.credentiels[index].issuer, data.credentiels[index].claims)
        Vpbaseschema.properties.verifiableCredential.items.push(vc_schema)
    }

    return Vpbaseschema
} 

const resolveSchema = async (ipfsHash: String)  : Promise<any> => {
    //let res= await ipfs.get(ipfsHash)
    let asyncitr = await ipfs.cat(ipfsHash)
    
    let mainContent="";
    for await(const itr of asyncitr){
        mainContent+=itr.toString();
    }
   return mainContent;
}

router.post('/api/createVpSchema', async (req : any, res : any) => {
    let did = req.body.did
    let data = req.body.data

    let vpSchema = setVpItems(data)

    let cid = await ipfs.add(JSON.stringify(vpSchema))
    
    let accounts = await web3.eth.getAccounts()
    const result = await contract.methods.setDidToSchemas(did, data.title, cid.path).send({from: accounts[0],
         gas:3000000});

    res.json({done: true, vpSchema, result, cid})
})

router.post('/api/verificationTemplates', async (req : any , res : any) => {
    let did = req.body.did
    try {
        if(did !== ""){
            const schemas = await contract.methods.getDidToSchema(did).call();
            res.status(201).json(schemas) 
        }
    } catch (error) {
        res.status(500).json({error});
    }   
}) 

router.post('/api/resolveVerificationTemplates', async (req : any , res : any) => {
    let did = req.body.did
    let name = req.body.name
    console.log("did",did);
    
    if(did !== "" && name !== ""){
        const ipfshash = await contract.methods.getSchemasPath(did, name).call();
        let vcSchema = await resolveSchema(ipfshash)
        vcSchema = JSON.parse(vcSchema)
        res.json({vcSchema}) 
    }
}) 

module.exports = router;
