// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract VpSchemaRegistry {

    struct Schema {
        string name;
        string path;
    }

    mapping (string=> Schema[]) private didToSchemas;

    event didToSchemaCreated(
        Schema[] schema
    );

    function setDidToSchemas(string memory _did, string memory _name, string memory _path) public {
        didToSchemas[_did].push(Schema(_name, _path)); 
        emit didToSchemaCreated(didToSchemas[_did]);
    }

    function getSchemasPath(string memory _did, string memory _name) public view returns (string memory) {
        Schema[] memory emptyTest = didToSchemas[_did];
        if (emptyTest.length == 0) {
            revert("DID does not exist");
        }

        string memory path;
        Schema[] memory tab = didToSchemas[_did];
        for (uint i=0; i< tab.length; i++) {
         if(keccak256(abi.encodePacked((tab[i].name))) == keccak256(abi.encodePacked((_name)))){
            path = tab[i].path;
         }
        }
        if(keccak256(abi.encodePacked((path))) == keccak256(abi.encodePacked(('')))){
            revert("Schema does not exist");
        }
        return path ;
    }

    function getDidToSchema(string memory _did) public view returns (Schema[] memory) {
        if (didToSchemas[_did].length == 0) {
            revert("DID does not exist");
        }
        return didToSchemas[_did];
    }

}