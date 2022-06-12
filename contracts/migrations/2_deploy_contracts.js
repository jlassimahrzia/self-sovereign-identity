const Registry = artifacts.require("Registry");
const SchemasRegistry = artifacts.require("SchemasRegistry");
const IssuerRegistry = artifacts.require("IssuerRegistry");


module.exports = function(deployer) {
  deployer.deploy(Registry);
  deployer.deploy(SchemasRegistry);
  deployer.deploy(IssuerRegistry);
};