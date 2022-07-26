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
        console.log("from service",tab);
        return tab;
    }


}
export default new BackupService();