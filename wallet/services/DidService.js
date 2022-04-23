import axios from 'axios'
class DidService {

    async createKeyPair(){
        let keyPair = {}
        await axios.get("http://10.71.0.214:8000/api/createKeyPair")
            .then(res => {
                keyPair = res.data._keypair
            })
            .catch(error => {
                console.log(error)
            });
        return keyPair;
    }

    async sendDidRequest(address, publickey){
        let id 
        await axios.post("http://10.71.0.214:8000/api/didRequest", {address, publickey})
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