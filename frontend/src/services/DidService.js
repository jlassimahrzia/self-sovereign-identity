import axios from 'axios'

class DidService {

    async getdidRequestList(){
        let tab = []
        await axios.get("http://localhost:8000/api/didRequestList")
            .then(res => {
                tab = res.data.list
            })
            .catch(error => {
                console.log(error)
            });
        return tab;
    } 

    async createIdentity(publickey){
        let identifier
        let cid 
        await axios.post("http://localhost:8000/api/createIdentity", {publickey})
            .then(res => {
                identifier = res.data.identifier
                cid = res.data.cid
            })
            .catch(error => {
                console.log(error)
            });
        console.log("identifier",identifier)
        return {identifier,cid};
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
        });
        return ddo
    }
}
export default new DidService();