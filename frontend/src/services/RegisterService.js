import axios from 'axios'

class RegisterService { 

    async createKeyPair(){
        let keyPair = {}
        
        await axios.get("http://localhost:8000/api/createKeyPair")
            .then(res => {
                keyPair = res.data._keypair 
            })
            .catch(error => {
                console.log(error)
            });
        return keyPair;
    }

    async sendIssuerRequest(category, name, email,phone, domain, website, date,address,publicKey, logo,file){ 
        let done = false
        await axios.post("http://localhost:8000/api/IssuerRequest",{category, name, email,phone, domain, website, date,address,publicKey,logo,file})
        .then(res=>{ 
            done=true 
            console.log(done)
            
        })
    }

}

export default new RegisterService();