import axios from 'axios'
import { environment } from '../constants/env';

class IssuerService {

    async getIssuerList(){
        let list = []
        await axios.get(`${environment.SERVER_API_URL}/issuersList`)
            .then(res => {
                list = res.data.list
            })
            .catch(error => {
                console.log(error)
            });
        return list;
    }

    async getSchemasList(did){
        let list = []
        await axios.post(`${environment.SERVER_API_URL}/schemas`, { did })
            .then(res => {
                list = res.data
            })
            .catch(error => {
                console.log(error)
            });
        return list;
    }

    async resolveSchema(did,name) {
        let schema
        await axios.post(`${environment.SERVER_API_URL}/resolveSchema`, {did,name}).then(res => {
            schema = res.data.vcSchema
        }).catch(error => {
            console.log(error)
        });
        return schema;
    }

    async sendVcRequest(did_holder, did_issuer, vc_name) {
        let id =false
        await axios.post(`${environment.SERVER_API_URL}/vcRequest`, {did_holder,did_issuer,vc_name}).then(res => {
            id = true
        }).catch(error => {
            console.log(error)
        });
        return id;
    }
}
export default new IssuerService();