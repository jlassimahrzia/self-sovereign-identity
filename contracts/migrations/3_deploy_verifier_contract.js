const VerifierRegistry = artifacts.require("VerifierRegistry");

module.exports = function(deployer) {
    deployer.deploy(VerifierRegistry);
};