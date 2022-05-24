import axios from 'axios' 
import jwt from 'jwt-decode' 

class VcSchemaService {

    async resolve(did) {
        let ddo = {}
        await axios.post("http://localhost:8000/api/resolve", { did })
            .then(res => {
                ddo = res.data.ddo
                console.log(res)
            })
            .catch(error => {
                console.log(error)
            });
        return ddo
    }

    async issueVC(formData,schemaName,privateKey,holder_pubKey){ 
        console.log(formData)
        let did = jwt(sessionStorage.getItem("token")).res[0].did
        let done = false
        await axios.post("http://localhost:8000/api/issueVC",{formData,schemaName,did,privateKey,holder_pubKey})
        .then(res=>{
            done=true 
            console.log(done)
            
        }).catch(error=>{ 
            console.log(error)
        })
     

    }

    async createVcSchema(data) {
        let did = jwt(sessionStorage.getItem("token")).res[0].did
        console.log("did",did);
        await axios.post("http://localhost:8000/api/createCredentialSchema", {data, did}).then(res => {
            console.log("res", res.data)
        }).catch(error => {
            console.log(error)
        });
    }

    async getSchemas() {
        let tab
        let did = jwt(sessionStorage.getItem("token")).res[0].did
        console.log("did",did);
        await axios.post("http://localhost:8000/api/schemas", {did}).then(res => {
            tab = res.data
            
        }).catch(error => {
            console.log(error)
        });
        return tab;
    }

    async resolveSchema(name) {
        let schema
        let did = jwt(sessionStorage.getItem("token")).res[0].did
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
