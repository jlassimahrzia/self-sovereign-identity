import axios from 'axios'
class AuthService {
    
    async sendAuthCreds(password,did){
        let done = false
        await axios.post("http://localhost:8000/api/sendAuthCreds", {password,did })
            .then(res => {
                done = true
            })
            .catch(error => {
                console.log(error)
            });
        
        return { done };
         
    }

    async login(did,password){ 
        let done = false
        let x;
        await axios.post("http://localhost:8000/api/login",{did,password})
        .then(res => {
            done = true
            x=res.data.token
        })
        .catch(error => {
            console.log(error)
            x=error
        });
    
        return { x,done };
    }

    async loginAdmin(email,password){ 
        let done = false
        let x;
        await axios.post("http://localhost:8000/api/loginAdmin",{email,password})
        .then(res => {
            done = true
            x=res.data.token
        })
        .catch(error => {
            console.log(error)
            x=error
        });
    
        return { x,done };
    }

    async checkPrivatekey(did,privateKey){ 
        let done 
        await axios.post("http://localhost:8000/api/checkPrivateKey",{did,privateKey})
        .then(res => {
            done=res.data.done
        })
        .catch(error => {
            console.log(error)
        });   
        return done;
    }

    
}

export default new AuthService();