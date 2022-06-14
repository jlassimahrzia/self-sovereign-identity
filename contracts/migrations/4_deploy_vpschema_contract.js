const VpSchemaRegistry = artifacts.require("VpSchemaRegistry");

module.exports = function(deployer) {
    deployer.deploy(VpSchemaRegistry);
};