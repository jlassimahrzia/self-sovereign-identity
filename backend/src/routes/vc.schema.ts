
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

let createCredentialSchema = (title: string, description:string, attributes: object, required: Array<string>) => {

    let baseschema = require("../config/vc.baseSchema.json")
    let vc_baseschema = JSON.parse(JSON.stringify(baseschema)); 
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
    /* const validate = ajv.compile(vc_baseschema)
    const valid = validate(data)
    if (!valid) console.log(validate.errors)
    else {
        console.log("Done");
    } */
    console.log(vc_baseschema)
    return vc_baseschema;
}

router.post('/api/createCredentialSchema', async (req : any , res : any) => {
    let attributes = req.body.data.properties
    let title = req.body.data.title
    let description = req.body.data.description
    let required = req.body.data.required
    let newSchema = createCredentialSchema(title, description, attributes,required)
    
    res.json({newSchema})
})

module.exports = router;