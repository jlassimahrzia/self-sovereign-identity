import axios from 'axios'
import toast from 'react-hot-toast';

class DidService {

    async createIdentity(){
        let keyPair = {}
        let cid = ""
        await axios.post("http://localhost:8000/api/createIdentity")
            .then(res => {
                keyPair = res.data._keypair
                cid = res.data._cid;
            })
            .catch(error => {
                console.log(error)
                toast.error("Something went wrong")
            });
        return {keyPair,cid};
    }

    async mappingDidToHash(cid, did){
        let done = false
        await axios.post("http://localhost:8000/api/mappingDidToHash", {cid, did})
        .then(res => {
            done = true
            console.log(res)
        })
        .catch(error => {
            console.log(error)
            toast.error("Something went wrong")
        });
        return done
    }

    async resolve(did) {
        let ddo = {}
        await axios.post("http://localhost:8000/api/resolve", {did})
        .then(res => {
            ddo = res.data.ddo
            console.log(res)
        })
        .catch(error => {
            console.log(error)
            toast.error("Something went wrong")
        });
        return ddo
    }
}
export default new DidService();