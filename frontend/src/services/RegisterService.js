import axios from 'axios'

class RegisterService {


    async sendIssuerRequest(category, name, email, phone, domain, website, dateCreation, description, location, fileName, formData2) {
        let done = false
        await axios.post("http://localhost:8000/api/IssuerRequest", {
            category,
            name,
            email,
            phone,
            domain,
            website,
            dateCreation,
            description,
            location,
            fileName,
            formData2,
            headers: { // Multer only parses "multipart/form-data" requests
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => {
            done = true
            console.log(done)

        })
    }

}

export default new RegisterService();
