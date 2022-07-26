import axios from 'axios'
import { environment } from '../constants/env';
class DidService {

    async createKeyPair(){
        let keyPair = {}
        await axios.get(`${environment.SERVER_API_URL}/createKeyPair`)
            .then(res => {
                keyPair = res.data._keypair
            })
            .catch(error => {
                console.log(error)
            });
        return keyPair;
    }

    async sendDidRequest(firstname, lastname, email, address, publickey){
        let id 
        await axios.post(`${environment.SERVER_API_URL}/didRequest`, {firstname, lastname, email, address, publickey})
            .then(res => {
                id = res.data.id
                console.log(res.id)
            })
            .catch(error => {
                console.log(error)
            });
        return id;
    }

    async getMnemonic(address){
        let phrase 
        await axios.post(`${environment.SERVER_API_URL}/getMnemonic`, {address})
            .then(res => {
                phrase = res.data.words
            })
            .catch(error => {
                console.log(error)
            });
        return phrase;
    }

    async getProfile(did) {
        let result = {}
        await axios.post(`${environment.SERVER_API_URL}/getProfile`, { did })
            .then(res => {
                result = res.data.result
            })
            .catch(error => {
                console.log(error)
            });
        return result
    }
}
export default new DidService();