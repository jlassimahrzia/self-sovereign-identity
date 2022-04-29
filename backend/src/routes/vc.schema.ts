import { format } from "path";

var express = require('express');
var app = express();
var router = express.Router()

const AJV = require('ajv').default;
const addFormats = require('ajv-formats').default;
const ajv = new AJV();
addFormats(ajv);
export interface Attribute {
    name: string,
    type: string,
    description: string,
    required: boolean,
    format?: string
}

const data = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "id": "urn:did:123456",
    "type": ["VerifiableCredential", "PersonalID"],
    "issuer": "did:exemple:9999999",
    "issuanceDate": "2021-11-01T00:00:00Z",
    "credentialSubject": {
        "id": "did:exemple:123",
        "firstName": "Mahrzia",
        "dateOfBirth": "1997-08-07"
    },
    "credentialSchema": {
        "id": "https://exemple/personlId",
        "type": "JsonSchemaValidator2018"
    }
}

let createCredentialSchema = (title: string, description:string, attributes: Array<Attribute>) => {

    let baseschema = require("../config/vc.baseSchema.json")
    let vc_baseschema = JSON.parse(JSON.stringify(baseschema)); 
    vc_baseschema.title = title
    vc_baseschema.description = description
    attributes.forEach(element => {
        if(element.required){
            vc_baseschema.properties.credentialSubject.required.push(element.name)
        }
        if(element.format){
            vc_baseschema.properties.credentialSubject.properties = {
                ...vc_baseschema.properties.credentialSubject.properties,
                [element.name]: {
                    "description": `${element.description}`,
                    "type": `${element.type}`,
                    "format": `${element.format}`
                }
            } 
        }
        else{
            vc_baseschema.properties.credentialSubject.properties = {
                ...vc_baseschema.properties.credentialSubject.properties,
                [element.name]: {
                    "description": `${element.description}`,
                    "type": `${element.type}`
                }
            }  
        }
    }); 
    const validate = ajv.compile(vc_baseschema)
    const valid = validate(data)
    if (!valid) console.log(validate.errors)
    else {
        console.log("Done");
    }
    return vc_baseschema;
}

router.post('/api/createCredentialSchema', async (req : any , res : any) => {
    let attributes = req.body.attributes
    let title = req.body.title
    let description = req.body.description

    let newSchema = createCredentialSchema(title, description, attributes)
    
    res.json({newSchema})
})

module.exports = router;