import { computeAddress } from '@ethersproject/transactions'
import { computePublicKey } from '@ethersproject/signing-key'
import { Wallet } from '@ethersproject/wallet'

var config = require('../../config.js');
var express = require('express');
var app = express();
const router = express.Router()
const didJWT = require('did-jwt')
const ipfsClient = require('ipfs-http-client')

const ipfs = ipfsClient.create('http://127.0.0.1:5001')

const Web3 = require('web3')
// Provider : Ganache Web3 provider
const web3 = new Web3('http://127.0.0.1:7545') 
let contract = new web3.eth.Contract(config.ABI_REGISTRY_CONTRACT, config.RGISTRY_CONTRACT_ADDRESS)


export type KeyPair = {
    address: string
    privateKey: string
    publicKey: string
    identifier: string
}

export interface DidDocument {
    '@context': string | string[];
    '@type': string, // Citizen / Organization
    id: string;
    publicKey : string;
    updated?: string;
    created?: string;
}
  
/**
 *  1- createKeyPair
 */

const createKeyPair= (): KeyPair => {
    const wallet = Wallet.createRandom()
    const privateKey = wallet.privateKey
    const address = computeAddress(privateKey)
    const publicKey = computePublicKey(privateKey, true)
    const identifier = `did:exemple:${publicKey}`
    return { address, privateKey, publicKey, identifier }
}

/**
 * 2- Create an Identity Document containing the Public Key
 */

const createDDO = (_KeyPair: KeyPair): DidDocument =>  {
    return { '@context': 'https://w3id.org/did/v1',
             '@type': 'Citizen', 
             id: _KeyPair.identifier, 
             publicKey: _KeyPair.publicKey,
             created: (new Date(Date.now())).toISOString()} //YYYY-MM-DDTHH:mm:ss.sssZ
};

/**
 * 3- Publish Identity Document to IPFS
*/

const pushDDO_ipfs = async (_ddo: DidDocument): Promise<String> => {
    const cid = await ipfs.add(JSON.stringify(_ddo))
    return cid
}

/**
 * Get ddo
 */

const resolve = async (ipfsHash: String)  : Promise<any> => {
    //let res= await ipfs.get(ipfsHash)
    let asyncitr = ipfs.cat(ipfsHash)

    for await (const itr of asyncitr) {

        let data = Buffer.from(itr).toString()
        console.log(JSON.parse(data.toString()))
        return JSON.parse(data.toString());
    } 
}
/**
 *  Create a did-JWT
 */

const createDidJWT = async(): Promise<any> => {
    let keypair = createKeyPair()
    
    const signer = didJWT.ES256KSigner(didJWT.hexToBytes(keypair.privateKey), true)
    const options = {
        signer: signer,
        alg: 'ES256K',
        issuer: 'did:exemple:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74',
    }
    const payload = {
        aud: keypair.identifier, 
        iss: 'did:exemple:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74',
        iat: Math.floor(Date.now() / 1000)
    }

    return didJWT.createJWT(payload, options)
    
}

router.get('/api/keypair', (req : any , res : any) => {
    res.json(createKeyPair())
})

router.get('/api/Jwt', async (req : any , res : any) =>{
    let jwt = await createDidJWT()
    let decode = didJWT.decodeJWT(jwt)
    res.json({jwt ,decode})
})

router.post('/api/addDDOtoIPFS', async (req : any , res : any) => {
    let _keypair: KeyPair
    let _ddo: DidDocument
    let _cid: String

    // 1- create key pair 
    _keypair = createKeyPair()
    // 2- Generate did doc
    _ddo = createDDO(_keypair)
    // 3- add did doc to ipfs and get the cid
    _cid = await pushDDO_ipfs(_ddo)
    
    res.json({_keypair,_cid})
})

// 4- Ethereum tx registring ipfs hash 
router.post('/api/mappingDidToHash', async (req : any , res : any) => {
    let _cid = req.body.cid
    let _did = req.body.did
    let accounts = await web3.eth.getAccounts()
    const result = await contract.methods.setDidToHash(_did,_cid).send({from: accounts[0],
        gas:3000000});
    res.json({result}) 
})

// 5- Resolve DID 
router.post('/api/resolve', async (req : any , res : any) => {
    let did = req.body.did
    console.log(did)
    const ipfshash = await contract.methods.getDidToHash(did).call();
    console.log(ipfshash)
    let ddo = await resolve(ipfshash)
    
    res.json({did,ipfshash,ddo}) 
})
module.exports = router;