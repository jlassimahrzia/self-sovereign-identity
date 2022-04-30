import axios from 'axios'

class VCService {

    async createVC(address,did,type,signature_type, name,signature_name, year,signature_year,proof) {
        let x
        await axios.post("http://localhost:8000/api/createVC", { address,did,type,signature_type, name,signature_name, year,signature_year,proof })
            .then(res => {
                console.log(res.data)
                x = res.data.x

            })
            .catch(error => {
                console.log(error)
            });
        return x;
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