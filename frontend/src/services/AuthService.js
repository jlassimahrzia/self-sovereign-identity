import axios from 'axios'
import { environment } from 'environment/env';

class AuthService {
    
    async sendAuthCreds(password,did){
        let done = false
        await axios.post(`${environment.SERVER_API_URL}/sendAuthCreds`, {password,did })
            .then(res => {
                done = true
            })
            .catch(error => {
                console.log(error)
            });
        
        return { done };
         
    }
    async sendAuthCredsVerifier(password,did){
        let done = false
        await axios.post(`${environment.SERVER_API_URL}/sendAuthCredsVerifier`, {password,did })
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
        await axios.post(`${environment.SERVER_API_URL}/login`,{did,password})
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

    async loginVerifier(did,password){ 
        console.log(`loginVerifier`);
        let done = false
        let x;
        await axios.post(`${environment.SERVER_API_URL}/loginVerifier`,{did,password})
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
        await axios.post(`${environment.SERVER_API_URL}/loginAdmin`,{email,password})
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
        await axios.post(`${environment.SERVER_API_URL}/checkPrivateKey`,{did,privateKey})
        .then(res => {
            done=res.data.done
        })
        .catch(error => {
            console.log(error)
        });   
        return done;
    }

    async checkPrivatekeyVerifier(did,privateKey){ 
        let done 
        await axios.post(`${environment.SERVER_API_URL}/checkPrivateKeyVerifier`,{did,privateKey})
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