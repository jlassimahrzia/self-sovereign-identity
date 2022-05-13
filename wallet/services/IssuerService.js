import axios from 'axios'
import { environment } from '../constants/env';
class IssuerService {

    async getIssuerList(){
        let list = []
        await axios.get(`${environment.SERVER_API_URL}/issuersList`)
            .then(res => {
                list = res.data.list
            })
            .catch(error => {
                console.log(error)
            });
        return list;
    }

    
}
export default new IssuerService();