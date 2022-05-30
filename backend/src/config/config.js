const registryContract = require("../../../contracts/build/contracts/Registry.json");
const schemaRegistryContract = require("../../../contracts/build/contracts/SchemasRegistry.json");
const issuerRegistry = require ("../../../contracts/build/contracts/IssuerRegistry.json")

module.exports = {
    PORT: 8000,
    ABI_REGISTRY_CONTRACT: registryContract.abi,
    RGISTRY_CONTRACT_ADDRESS : registryContract.networks[5777].address,

    ABI_ISSUER_REGISTRY_CONTRACT : issuerRegistry.abi,
    ISSUER_REGISTRY_CONTRACT_ADDRESS : issuerRegistry.networks[5777].address,
    
    ABI_SCHEMA_REGISTRY_CONTRACT: schemaRegistryContract.abi,
    RGISTRY_SCHEMA_CONTRACT_ADDRESS : schemaRegistryContract.networks[5777].address,
    
    HOST: "localhost",
    USER: "root",
    PASSWORD: "",
    DB: "ssi"
};