// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Registry {
   
    mapping (string => string) private didToHash;

    uint256 public didCounter ;
  
    constructor() {
      
    }

    event didToHashCreated(
        string ipfshash,
        uint256 didCounter
    );

    function setDidToHash(string memory _did, string memory _newHash) public {
        bytes memory emptyTest = bytes(didToHash[_did]);
        if (emptyTest.length != 0) {
            // allow you to return a value & Refund the remaining gas to the caller
            revert("DID already exist");
        }
        didCounter ++;
        didToHash[_did] = _newHash;
        emit didToHashCreated(didToHash[_did],didCounter);
    }

    function getDidToHash(string memory _did) public view returns (string memory) {
       string memory hashipfs = didToHash[_did];
       return hashipfs;
    }

}