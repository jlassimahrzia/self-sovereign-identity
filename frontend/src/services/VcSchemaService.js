import axios from 'axios'

class VcSchemaService {

    async createVcSchema(data) {
        let did = "did:exemple:0x03099c28987c908674a0afd613ad7f91839816d83ad2a47e34936bc4417825b851"
        await axios.post("http://localhost:8000/api/createCredentialSchema", {data,did})
            .then(res => {
                console.log("res",res.data)
            })
            .catch(error => {
                console.log(error)
            });
    }

}
export default new VcSchemaService();