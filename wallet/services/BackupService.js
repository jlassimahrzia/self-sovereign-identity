import axios from 'axios'
import { environment } from '../constants/env';
import DidService from './DidService'
class BackupService {

    async sendTrusteeRequest(did_holder, did_trustee){
        let id 
        await axios.post(`${environment.SERVER_API_URL}/sendTrusteeRequest`, {did_holder, did_trustee})
            .then(res => {
                id = res.data.id
            })
            .catch(error => {
                console.log(error)
            });
        return id;
    }

    async getRecoveryNetworkList(did){
        let list = []
        await axios.post(`${environment.SERVER_API_URL}/recoveryNetworkList`,{did})
            .then(res => {
                list = res.data.list
            })
            .catch(error => {
                console.log(error)
            });
        let tab = []
        await Promise.all(list.map(async (element) => {
            let result = await DidService.getProfile(element.did_trustee)
            let ddo = result.ddo
            let request = {...element, ddo}
            tab.push(request)
        }));
        return tab;
    }

    async gettrusteeRequestList(did){
        let list = []
        await axios.post(`${environment.SERVER_API_URL}/trusteeRequestList`,{did})
            .then(res => {
                list = res.data.list
            })
            .catch(error => {
                console.log(error)
            });
        let tab = []
        await Promise.all(list.map(async (element) => {
            let result = await DidService.getProfile(element.did_holder)
            let ddo = result.ddo
            let request = {...element, ddo}
            tab.push(request)
        }));
        return tab;
    }

    async acceptRequest(id){
        let result = false
        await axios.post(`${environment.SERVER_API_URL}/acceptTrusteeRequest`,{id})
        .then(res => {
            result = res.data.result
        })
        .catch(error => {
            console.log(error)
        });
        return result
    }

    async declineRequest(id){
        let test 
        await axios.post(`${environment.SERVER_API_URL}/declineTrusteeRequest`,{id})
        .then(res => {
            test = res.data.result
            console.log("result",test);
        })
        .catch(error => {
            console.log(error)
        });
        console.log(test);
        return test
    }

    async decryptFragment(encrypted, privateKey){
        let test = {}
        await axios.post(`${environment.SERVER_API_URL}/decryptFragment`,{encrypted, privateKey})
            .then(res => {
                test = res.data.result
            })
            .catch(error => {
                console.log(error)
            });
        return test;
    }

    async sendFragments(did, privateKey, threshold){
        let test 
        await axios.post(`${environment.SERVER_API_URL}/backupKey`,{did, privateKey, threshold})
            .then(res => {
                test = res.data.done
            })
            .catch(error => {
                console.log(error)
            });
        return test;
    }

    async sendFragmentToHolder(did_holder, fragment){
        let test 
        await axios.post(`${environment.SERVER_API_URL}/sendFragment`,{did_holder, fragment})
            .then(res => {
                test = res.data.done
            })
            .catch(error => {
                console.log(error)
            });
        return test;
    }

}
export default new BackupService();