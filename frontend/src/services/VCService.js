import axios from 'axios'
import jwt from 'jwt-decode'
import { environment } from 'environment/env';

class VCService {

    async issueVC(formData, item, privateKey, ddo) {
      
        let did = jwt(sessionStorage.getItem("token")).res[0].did
        let done = false
        await axios.post(`${environment.SERVER_API_URL}/issueVC`, {
            formData,
            item,
            did,
            privateKey,
            ddo
        }).then(res => {
            done = res.data.done
            console.log(done)

        }).catch(error => {
            console.log(error)
        })
        return done
    }

    async getVCRequestList(didIssuer) {

        let tab = []
        await axios.post(`${environment.SERVER_API_URL}/vcRequestList`, {didIssuer}).then(res => {
            tab = res.data.list
        }).catch(error => {
            console.log(error)
        });
        return tab;
    }

    async createVC(id, did, familyName, firstName, dateOfBirth, privateKey) {
        let x
        await axios.post(`${environment.SERVER_API_URL}/createVC`, {
            id,
            did,
            familyName,
            firstName,
            dateOfBirth,
            privateKey
        }).then(res => {
            console.log(res.data)
            x = res.data.x

        }).catch(error => {
            console.log(error)
        });
        return x;
    }

    async createVCFailed(id, email) {
        let done = false
        await axios.post(`${environment.SERVER_API_URL}/createVCFailed`, {id, email}).then(res => {
            done = res.data.done
            console.log(res)
        }).catch(error => {
            console.log(error)
        });

        return done
    }

    async showUsedDID() {
        let tab = []
        await axios.get(`${environment.SERVER_API_URL}/GetDIDs`).then(res => {
            tab = res.data.list
        }).catch(error => {
            console.log(error)
        });
        return tab;
    }
}
export default new VCService();
