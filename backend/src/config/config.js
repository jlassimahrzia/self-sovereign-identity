const registryContract = require("../../../contracts/build/contracts/Registry.json");
const schemaRegistryContract = require("../../../contracts/build/contracts/SchemasRegistry.json");
const issuerRegistry = require ("../../../contracts/build/contracts/IssuerRegistry.json")
const verifierRegistry = require ("../../../contracts/build/contracts/VerifierRegistry.json")
const vpSchemaRegistry = require ("../../../contracts/build/contracts/VpSchemaRegistry.json")

module.exports = {
    PORT: 8000,
    ABI_REGISTRY_CONTRACT: registryContract.abi,
    RGISTRY_CONTRACT_ADDRESS : registryContract.networks[5777].address,

    ABI_ISSUER_REGISTRY_CONTRACT : issuerRegistry.abi,
    ISSUER_REGISTRY_CONTRACT_ADDRESS : issuerRegistry.networks[5777].address,
    
    ABI_SCHEMA_REGISTRY_CONTRACT: schemaRegistryContract.abi,
    RGISTRY_SCHEMA_CONTRACT_ADDRESS : schemaRegistryContract.networks[5777].address,

    ABI_VERIFIER_REGISTRY_CONTRACT: verifierRegistry.abi,
    RGISTRY_VERIFIER_CONTRACT_ADDRESS : verifierRegistry.networks[5777].address,

    ABI_VP_SCHEMA_REGISTRY_CONTRACT: vpSchemaRegistry.abi,
    VP_SCHEMA_VERIFIER_CONTRACT_ADDRESS : vpSchemaRegistry.networks[5777].address,
    
    HOST: "localhost",
    USER: "root",
    PASSWORD: "",
    DB: "ssi",

    /* 
        MAILTRAP_USER : "331a15d20b66f4",
        MAILTRAP_PASS : "4efe60cdf7001e",
        MAILTRAP_HOST : "smtp.MAIL.io",
        MAILTRAP_PORT : 587,
        MAILTRAP_FROM_ADDRESS : "identityTN@example.com" 
    */
    MAIL_USER : 'user',
    MAIL_PASS : 'password',
    MAIL_HOST : '127.0.0.1',
    MAIL_PORT : '1025',
    MAIL_FROM_ADDRESS : "identityTN@example.com"
};