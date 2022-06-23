import axios from 'axios'
import { environment } from '../constants/env';
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

    async verificationTemplatesList(did){
        let tab
        await axios.post(`${environment.SERVER_API_URL}/verificationTemplates`, {did}).then(res => {
            tab = res.data
        }).catch(error => {
            console.log(error)
        });
        return tab;
    }

    async resolveVerificationTemplate(did , name) {
        let schema
        await axios.post(`${environment.SERVER_API_URL}/resolveVerificationTemplates`, {did,name}).then(res => {
            schema = res.data.vcSchema
        }).catch(error => {
            console.log(error)
        });
        return schema;
    }

    async sendVerificationRequest(did_holder, did_verifier, verification_name) {
        let done =false
        await axios.post(`${environment.SERVER_API_URL}/verificationRequest`, 
        {did_holder,did_verifier,verification_name}).then(res => {
            done =res.data.done
        }).catch(error => {
            console.log(error)
        });
        return done;
    }

    async verifyVerificationTemplate(encrypted, privateKey){
        let test = {}
        await axios.post(`${environment.SERVER_API_URL}/verifyVerificationRequest`,{encrypted, privateKey})
            .then(res => {
                test = res.data.result
            })
            .catch(error => {
                console.log(error)
            });
        return test;
    }

}
export default new VerifierService();