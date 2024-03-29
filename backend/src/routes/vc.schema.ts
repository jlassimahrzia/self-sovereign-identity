var express = require('express');
var app = express();
var router = express.Router();
var config = require('../config/config.js');

// IPFS
var ipfsClient = require('ipfs-http-client')
var ipfs = ipfsClient.create('http://127.0.0.1:5001')

// Contract
let Web3 = require('web3')
let web3 = new Web3('http://127.0.0.1:7545')  
let contract = new web3.eth.Contract(config.ABI_SCHEMA_REGISTRY_CONTRACT, config.RGISTRY_SCHEMA_CONTRACT_ADDRESS)


const createCredentialSchema = (title: string, description:string, attributes: object, required: Array<string>)  : any => {

    /* 1- Get base Schema*/
    let baseschema = require("../config/vc.baseSchema.json")
    let vc_baseschema = JSON.parse(JSON.stringify(baseschema)); 

    /* 2- set new VC Schema*/
    vc_baseschema.title = title
    vc_baseschema.description = description
    vc_baseschema.properties.credentialSubject.required = [...required]

    for (const [key, value] of Object.entries(attributes)) {
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
    return vc_baseschema;
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


router.post('/api/createCredentialSchema', async (req : any , res : any) => {
    let attributes = req.body.data.properties
    let title = req.body.data.title
    let description = req.body.data.description
    let required = req.body.data.required
    let did = req.body.did
    let newSchema = createCredentialSchema(title, description, attributes,required)
 
    /* 2- Add to ipfs */
    let cid = await ipfs.add(JSON.stringify(newSchema))
    /* 3- Store in SchemaRegistry SC */
    let accounts = await web3.eth.getAccounts()
    const result = await contract.methods.setDidToSchemas(did, title, cid.path).send({from: accounts[0],
        gas:3000000});

    res.json({newSchema, result, cid})
})

router.post('/api/resolveSchema', async (req : any , res : any) => {
    let did = req.body.did
    let name = req.body.name
    if(did !== "" && name !== ""){
        const ipfshash = await contract.methods.getSchemasPath(did, name).call();
        let vcSchema = await resolveSchema(ipfshash)
        vcSchema = JSON.parse(vcSchema)
        res.json({vcSchema}) 
    }
}) 

router.post('/api/schemas', async (req : any , res : any) => {
    let did = req.body.did
    try {
        if(did !== ""){
            const schemas = await contract.methods.getDidToSchema(did).call();
            res.status(201).json(schemas) 
        }
    } catch (error) {
        //res.status(500).json({error});
    }   
}) 

module.exports = router;