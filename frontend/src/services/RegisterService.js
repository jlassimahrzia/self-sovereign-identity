import axios from 'axios'

class RegisterService {

    async sendIssuerRequest(data , file , image) {
        let done = false
        //let finaldata = {...data, image : image}
        //console.log(finaldata);
        console.log("pdfFile",file);
        console.log("photo",image);
        await axios.post("http://localhost:8000/api/IssuerRequest", {file}).then(res => {
            done = true
            console.log(done)
        })
    }

}

export default new RegisterService();
