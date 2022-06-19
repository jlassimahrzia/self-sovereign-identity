import axios from 'axios' 
import jwt from 'jwt-decode' 
import { environment } from 'environment/env';

class VcSchemaService {

    async createVcSchema(data) {
        let did = jwt(sessionStorage.getItem("token")).res[0].did
        await axios.post(`${environment.SERVER_API_URL}/createCredentialSchema`, {data, did}).then(res => {
            console.log("res", res.data)
        }).catch(error => {
            console.log(error)
        });
    }

    async getSchemas() {
        let tab
        let did = jwt(sessionStorage.getItem("token")).res[0].did
        await axios.post(`${environment.SERVER_API_URL}/schemas`, {did}).then(res => {
            tab = res.data
        }).catch(error => {
            console.log(error)
        });
        return tab;
    }

    async resolveSchema(name) {
        let schema
        let did = jwt(sessionStorage.getItem("token")).res[0].did
        await axios.post(`${environment.SERVER_API_URL}/resolveSchema`, {did,name}).then(res => {
            schema = res.data.vcSchema
        }).catch(error => {
            console.log(error)
        });
        console.log("from service",schema)
        return schema;
    }

    async getSchemasByIssuer(did) {
        let tab
        await axios.post(`${environment.SERVER_API_URL}/schemas`, {did}).then(res => {
            tab = res.data
        }).catch(error => {
            console.log(error)
        });
        return tab;
    }

    async resolveSchemaByNameAndIssuer(did, name) {
        let schema
        await axios.post(`${environment.SERVER_API_URL}/resolveSchema`, {did,name}).then(res => {
            schema = res.data.vcSchema
        }).catch(error => {
            console.log(error)
        });
        console.log("from service",schema)
        return schema;
    }
}
export default new VcSchemaService();
