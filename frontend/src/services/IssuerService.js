import axios from 'axios'
import { environment } from 'environment/env';

class IssuerService { 

   
    async getIssuersList() {
        let tab = []
        await axios.get(`${environment.SERVER_API_URL}/IssuerRequestList`)
     
            .then(res => {
                console.log(res)
                tab = res.data.list
                
            })
            .catch(error => {
                console.log(error)
            });
        return tab;
    }


    async createIssuer(name,email, id) {
        let identifier
        let cid
        await axios.post(`${environment.SERVER_API_URL}/createIssuer`, {name, email, id})
            .then(res => {
                identifier = res.data.identifier
                cid = res.data.cid
            })
            .catch(error => {
                console.log(error)
            });
        
        return { identifier, cid };
    }

    async createIssuerFailed(email, id) {
        let done = false
        await axios.post(`${environment.SERVER_API_URL}/createIssuerFailed`, { email, id })
            .then(res => {
                done = true
                console.log(res)
            })
            .catch(error => {
                console.log(error)
            });

        return { done };
    }

    async mappingDidToHash(cid, did) {
        let done = false
        await axios.post(`${environment.SERVER_API_URL}/mappingDidToHashIssuer`, { cid, did })
            .then(res => {
                done = true
                console.log(res)
            })
            .catch(error => {
                console.log(error)
            });
        return done
    }

    async resolve(did) {
        let ddo = {}
        await axios.post(`${environment.SERVER_API_URL}/resolveIssuer`, { did })
            .then(res => {
                ddo = res.data.ddo
                console.log(res)
            })
            .catch(error => {
                console.log(error)
            });
        return ddo
    }

    async getIssuers(){
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

}

export default new IssuerService();