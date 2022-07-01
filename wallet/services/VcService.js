import axios from 'axios'
import { environment } from '../constants/env';
class VcService {

    async verifyVC(encrypted, privateKey){
        let test = {}
        await axios.post(`${environment.SERVER_API_URL}/verifyVC`,{encrypted, privateKey})
            .then(res => {
                test = res.data.result
            })
            .catch(error => {
                console.log(error)
            });
        return test;
    }

    async signVC(vc, privateKey){
        let result = {}
        await axios.post(`${environment.SERVER_API_URL}/signVC`,{vc, privateKey})
            .then(res => {
                result = res.data.result
            })
            .catch(error => {
                console.log(error)
            });
        return result;
    }

    async getVCRequestList(didholder) {
        let tab = []
        await axios.post(`${environment.SERVER_API_URL}/vcRequestListByHolder`, {didholder}).then(res => {
            tab = res.data.list
        }).catch(error => {
            console.log(error)
        });
        return tab;
    }
}
export default new VcService();