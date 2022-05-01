const Registry = artifacts.require("Registry");
const SchemasRegistry = artifacts.require("SchemasRegistry");

module.exports = function(deployer) {
  deployer.deploy(Registry);
  deployer.deploy(SchemasRegistry);
};