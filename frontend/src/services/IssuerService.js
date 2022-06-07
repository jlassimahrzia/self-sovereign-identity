import axios from 'axios'

class IssuerService { 

   
    async getIssuersList() {
        let tab = []
        await axios.get("http://localhost:8000/api/IssuerRequestList")
     
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
        await axios.post("http://localhost:8000/api/createIssuer", {name, email, id})
            .then(res => {
                identifier = res.data.identifier
                cid = res.data.cid
            })
            .catch(error => {
                console.log(error)
            });
        console.log("identifier", identifier)
        return { identifier, cid };
    }

    async createIssuerFailed(email, id) {
        let done = false
        await axios.post("http://localhost:8000/api/createIssuerFailed", { email, id })
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
        await axios.post("http://localhost:8000/api/mappingDidToHashIssuer", { cid, did })
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
        await axios.post("http://localhost:8000/api/resolveIssuer", { did })
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

export default new IssuerService();