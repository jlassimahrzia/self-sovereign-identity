import axios from 'axios'

class VCService {



    async getVCRequestList(didIssuer) {
       
        let tab = []
        await axios.post("http://localhost:8000/api/vcRequestList",{didIssuer})
            .then(res => {
                tab = res.data.list
            })
            .catch(error => {
                console.log(error)
            });
        return tab;
    }

    async createVC(id,did,familyName, firstName, dateOfBirth,privateKey) {
        let x
        await axios.post("http://localhost:8000/api/createVC", {id,did,familyName, firstName, dateOfBirth,privateKey })
            .then(res => {
                console.log(res.data)
                x = res.data.x

            })
            .catch(error => {
                console.log(error)
            });
        return x;
    }

    async createVCFailed(id) {
        let done = false
        await axios.post("http://localhost:8000/api/createVCFailed", {id })
            .then(res => {
                done = true
                console.log(res)
            })
            .catch(error => {
                console.log(error)
            });

        return { done };
    }

    async showUsedDID() {
        let tab = []
        await axios.get("http://localhost:8000/api/GetDIDs")
            .then(res => {
                tab = res.data.list
            })
            .catch(error => {
                console.log(error)
            });
        return tab;
    }
}
export default new VCService();