import axios from 'axios'

class VcSchemaService {

    async createVcSchema(data) {
        let did = "did:exemple:0x03099c28987c908674a0afd613ad7f91839816d83ad2a47e34936bc4417825b851"
        await axios.post("http://localhost:8000/api/createCredentialSchema", {data, did}).then(res => {
            console.log("res", res.data)
        }).catch(error => {
            console.log(error)
        });
    }

    async getSchemas() {
        let tab
        let did = "did:exemple:0x03099c28987c908674a0afd613ad7f91839816d83ad2a47e34936bc4417825b851"
        await axios.post("http://localhost:8000/api/schemas", {did}).then(res => {
            tab = res.data
            
        }).catch(error => {
            console.log(error)
        });
        return tab;
    }

    async resolveSchema(name) {
        let schema
        let did = "did:exemple:0x03099c28987c908674a0afd613ad7f91839816d83ad2a47e34936bc4417825b851"
        await axios.post("http://localhost:8000/api/resolveSchema", {did,name}).then(res => {
            schema = res.data
        }).catch(error => {
            console.log(error)
        });
        console.log("from service",schema)
        return schema;
    }

}
export default new VcSchemaService();
