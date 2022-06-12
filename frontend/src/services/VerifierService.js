import axios from 'axios'

class VerifierService { 
 
    async getVerifierList() {
        let tab = []
        await axios.get("http://localhost:8000/api/VerifierList")  
            .then(res => {
                console.log(res)
                tab = res.data.list
            })
            .catch(error => {
                console.log(error)
            });
        return tab;
    }

    async createVerifier(name,email, id) {
        let identifier
        let cid
        await axios.post("http://localhost:8000/api/createVerifier", {name, email, id})
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

    async createVerifierFailed(email, id) {
        let done = false
        await axios.post("http://localhost:8000/api/createVerifierFailed", { email, id })
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
        await axios.post("http://localhost:8000/api/mappingDidToHashVerifier", { cid, did })
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
        await axios.post("http://localhost:8000/api/resolveVerifier", { did })
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

export default new VerifierService();