import axios from 'axios'

class RegisterService {

    async sendIssuerRequest(data , files) {
        let done = false
        let logo 
        let file 

        await axios.post("http://localhost:8000/api/uploadFiles"
        , files , 
        {headers:{"Content-Type": "application/x-www-form-urlencoded" }})
        .then(res => {
            logo = res.data.logo
            file = res.data.file
        })
        .catch(error => {
            console.log(error)
        });

        data = {...data, logo : logo, file: file}

        await axios.post("http://localhost:8000/api/IssuerRequest", data)
        .then(res => {
            done = true
            console.log(done)
        })
        .catch(error => {
            console.log(error)
        });
        return done 
    }

}

export default new RegisterService();
