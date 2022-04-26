const registryContract = require("../../../contracts/build/contracts/Registry.json");

module.exports = {
    PORT: 8000,
    ABI_REGISTRY_CONTRACT: registryContract.abi,
    RGISTRY_CONTRACT_ADDRESS : registryContract.networks[5777].address,
    HOST: "localhost",
    USER: "root",
    PASSWORD: "",
    DB: "ssi"
};