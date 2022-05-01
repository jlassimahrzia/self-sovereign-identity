import axios from 'axios'

class VcSchemaService {

    async createVcSchema(data) {
        await axios.post("http://localhost:8000/api/createCredentialSchema", {data})
            .then(res => {
                console.log("res",res.data)
            })
            .catch(error => {
                console.log(error)
            });
    }

}
export default new VcSchemaService();