import axios from 'axios'
import { environment } from 'environment/env';

class DidService {

    async getdidRequestList() {
        let tab = []
        await axios.get(`${environment.SERVER_API_URL}/didRequestList`)
            .then(res => {
                tab = res.data.list
            })
            .catch(error => {
                console.log(error)
            });
        return tab;
    }

    async createIdentity(publickey, email, id) {
        let identifier
        let cid
        await axios.post(`${environment.SERVER_API_URL}/createIdentity`, { publickey, email, id })
            .then(res => {
                identifier = res.data.identifier
                cid = res.data.cid
            })
            .catch(error => {
                console.log(error)
            });
        
        return { identifier, cid };
    }

    async createIdentityFailed(email, id) {
        let done = false
        await axios.post(`${environment.SERVER_API_URL}/createIdentityFailed`, { email, id })
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
        await axios.post(`${environment.SERVER_API_URL}/mappingDidToHash`, { cid, did })
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
        await axios.post(`${environment.SERVER_API_URL}/resolve`, { did })
            .then(res => {
                ddo = res.data.ddo
                console.log(res)
            })
            .catch(error => {
                console.log(error)
            });
        return ddo
    }
}
export default new DidService();