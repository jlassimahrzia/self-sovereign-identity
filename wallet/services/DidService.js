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
}
export default new DidService();