import axios from 'axios'
import jwt from 'jwt-decode' 
import { environment } from 'environment/env';

class VerifierService { 
 
    async getVerifierList() {
        let tab = []
        await axios.get(`${environment.SERVER_API_URL}/VerifierList`)  
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
        await axios.post(`${environment.SERVER_API_URL}/createVerifier`, {name, email, id})
            .then(res => {
                identifier = res.data.identifier
                cid = res.data.cid
            })
            .catch(error => {
                console.log(error)
            });
        console.log(`identifier`, identifier)
        return { identifier, cid };
    }

    async createVerifierFailed(email, id) {
        let done = false
        await axios.post(`${environment.SERVER_API_URL}/createVerifierFailed`, { email, id })
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
        await axios.post(`${environment.SERVER_API_URL}/mappingDidToHashVerifier`, { cid, did })
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
        await axios.post(`${environment.SERVER_API_URL}/resolveVerifier`, { did })
            .then(res => {
                ddo = res.data.ddo
                console.log(res)
            })
            .catch(error => {
                console.log(error)
            });
        return ddo
    }

    async createVerificationSchema(data){
        let done = false
        let did = jwt(sessionStorage.getItem("token")).res[0].did
        await axios.post(`${environment.SERVER_API_URL}/createVpSchema`, { did , data })
            .then(res => {
                done = res.data.done
                console.log(res.data.vpSchema)
            })
            .catch(error => {
                console.log(error)
            });
        return done
    }

    async verificationTemplatesList(data){
        let tab
        let did = jwt(sessionStorage.getItem("token")).res[0].did
        await axios.post(`${environment.SERVER_API_URL}/verificationTemplates`, {did}).then(res => {
            tab = res.data
        }).catch(error => {
            console.log(error)
        });
        return tab;
    }

    async verificationTemplatesList2(){
        let tab
        let did = jwt(sessionStorage.getItem("token")).res[0].did
        await axios.post(`${environment.SERVER_API_URL}/verificationTemplates`, {did}).then(res => {
            tab = res.data
        }).catch(error => {
            console.log(error)
        });
        return tab;
    }

    async resolveVerificationTemplate(name) {
        let schema
        let did = jwt(sessionStorage.getItem("token")).res[0].did
        await axios.post(`${environment.SERVER_API_URL}/resolveVerificationTemplates`, {did,name}).then(res => {
            schema = res.data.vcSchema
        }).catch(error => {
            console.log(error)
        });
        return schema;
    }

    async getServicesRequestList(didVerifier) {
        let tab = []
        await axios.post(`${environment.SERVER_API_URL}/servicesRequestList`, {didVerifier}).then(res => {
            tab = res.data.list
        }).catch(error => {
            console.log(error)
        });
        return tab;
    }

    async sendVerificationRequest(request){
        let privateKey = sessionStorage.getItem("privateKey")
        let done = false
        await axios.post(`${environment.SERVER_API_URL}/sendVerificationRequest`, {request, privateKey}).then(res => {
            done = res.data.done
        }).catch(error => {
            console.log(error)
        });
        return done;
    }

    async getVerificationResponseList() {
        let tab = []
        let didVerifier = jwt(sessionStorage.getItem("token")).res[0].did
        await axios.post(`${environment.SERVER_API_URL}/verificationResponseList`, {didVerifier}).then(res => {
            tab = res.data.list
        }).catch(error => {
            console.log(error)
        });
        return tab;
    }

    async verifyResponse(response){
        let test = {}
        let privateKey = sessionStorage.getItem("privateKey")
        await axios.post(`${environment.SERVER_API_URL}/verifyResponse`,{response,privateKey})
            .then(res => {
                test = res.data.result
            })
            .catch(error => {
                console.log(error)
            });
        return test;
    }

    async acceptRequest(id){
        let test = false
        await axios.post(`${environment.SERVER_API_URL}/acceptRequest`,{id})
            .then(res => {
                test = res.data.done
            })
            .catch(error => {
                console.log(error)
            });
        return test;
    }

    async declineRequest(id){
        let test = false
        await axios.post(`${environment.SERVER_API_URL}/declineRequest`,{id})
            .then(res => {
                test = res.data.done
            })
            .catch(error => {
                console.log(error)
            });
        return test;
    }

    async declineService(id){
        let test = false
        await axios.post(`${environment.SERVER_API_URL}/declineService`,{id})
            .then(res => {
                test = res.data.done
            })
            .catch(error => {
                console.log(error)
            });
        return test;
    }
}

export default new VerifierService();