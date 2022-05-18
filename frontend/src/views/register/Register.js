import React from 'react'
import {useState, useEffect} from 'react'
import{Form, FormGroup,Label,Input,Button} from "reactstrap";
import RegisterService from 'services/RegisterService';


import { Toaster } from 'react-hot-toast';
import swal from 'sweetalert';
import Home from 'views/home/Home';


function Register() {
  
  const [address, setAddress] = useState("")
  const [publicKey, setPublicKey] = useState("")
  const [privateKey, setPrivateKey] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [category, setCategory] = useState("")

  const [domain, setDomain] = useState("")
  const [website, setWebsite] = useState("")
  const [date, setDate] = useState("")
  const [phone, setPhone] = useState("")
  const logo = "a" 
  const file ="aa"
 
  // const saveLogo = (e) => {
  //   setLogo(e.target.files[0]);
  //   setLogoName(e.target.files[0].name);
  //   console.log(e.target.files[0].name)
  //   console.log(e.target.files[0])
  // };




  // const uploadFile = async (e) => {
   
  //   const formData = new FormData();
  //   formData.append("image", file);
    
  //   console.log(formData)
  //   try {

  //     const res = await axios.post(
  //       "http://localhost:8000/api/upload",
  //       formData
  //     );
  //     console.log(res);
  //   } catch (ex) {
  //     console.log(ex);
  //   }
  // };


    const keyPairs = async ()=>{ 
      let data = await RegisterService.createKeyPair(); 
      console.log(data)
      setAddress(data.address)
      setPublicKey(data.publicKey)
      setPrivateKey(data.privateKey)
    }

    

   
   


    useEffect(() => {
      keyPairs();
    }, [setAddress,setPublicKey])

    const sendIssuerRequest = async()=>{ 
     console.log(publicKey)


    
       
          const data = await RegisterService.sendIssuerRequest(category, name, email,phone, domain, website, date,address,publicKey,logo,file)
          console.log(data)


           swal("Your registration process is done!", "A keystore file will be downloaded automatically. Keep it safe!",  "success");
          const keystorefile = JSON.stringify({address:address,privateKey:privateKey, publicKey:publicKey})
          const blob = new Blob([keystorefile], {type: "text/plain"});
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = 'keystorefile.json';
          link.href = url;
          link.click();

      
        //  console.log("error")
       
        //  swal("An error occured!", "",  "warning");

       
   
        
    }

  return (
  <div>
  <Home/>
    <div class="row align-items-center vh-100" style={{ marginTop: "50px",marginBottom:"50px"}}>
    <div><Toaster/></div>
        <div class="col-6 mx-auto" >
            <div class="card shadow border" >
                <div class="card-body  flex-column align-items-center" >
    <Form>
  <FormGroup>
    <Label for="exampleEmail">
      DID request
    </Label>
    <Input
      plaintext
      value="Fill in informations to request a DID"
    />
  </FormGroup>


  <FormGroup>
  <Label for="exampleName">
    Organization Name
  </Label>
  <Input
    id="exampleName"
    name="name"
    placeholder="name"
    type="name"
    onChange={(e) => setName(e.target.value)}
  />
</FormGroup>

  <FormGroup >
  <Label for="exampleSelect"  >
    Organization Category
  </Label>
  <Input
  
    id="exampleSelect"
    name="select"
    type="select"
    onChange={(e) => setCategory(e.target.value) }
   
    
  >
  <option></option>
    <option value="Association" onChange={(e) => setCategory(e.target.value)}>
      Association
      
    </option>
    <option value="Entreprise" onChange={(e) => setCategory(e.target.value)}>
      Entreprise
    </option>
    <option value="Organization" onChange={(e) => setCategory(e.target.value)}>
      Organization
    </option>
    
  </Input>
</FormGroup>

<FormGroup >
<Label for="exampleSelect">
  Organization Domain
</Label>
<Input
  id="exampleSelect"
  name="select"
  type="select"
 
  onChange={(e) => setDomain(e.target.value)}
>
<option></option>
  <option value="Studies" onChange={(e) => setDomain(e.target.value)}>
    Studies
  </option>
  <option value="Healthcare" onChange={(e) => setDomain(e.target.value)}>
    Healthcare
  </option>
  <option value="Technologies" onChange={(e) => setDomain(e.target.value)}>
    Technologies
  </option>
  
</Input>
</FormGroup>


  <FormGroup>
    <Label for="exampleEmail">
      Email
    </Label>
    <Input
      id="exampleEmail"
      name="email"
      placeholder="email@example.com"
      type="email"
      onChange={(e) => setEmail(e.target.value)}
    />
  </FormGroup>


  <FormGroup>
  <Label for="exampleEmail">
    Phone Number
  </Label>
  <Input
    id="exampleEmail"
    name="email"
    placeholder="12 345 678"
    type="number"
    onChange={(e) => setPhone(e.target.value)}
  />
</FormGroup>
  
  <FormGroup>
    <Label for="exampleUrl">
      Website
    </Label>
    <Input
      id="exampleUrl"
      name="url"
      placeholder="www.website.com"
      type="url"
      onChange={(e) => setWebsite(e.target.value)}
    />
  </FormGroup>
 

  <FormGroup>
    <Label for="exampleDate">
      Creation Date
    </Label>
    <Input
      id="exampleDate"
      name="date"
      placeholder="date placeholder"
      type="date"
      onChange={(e) => setDate(e.target.value)}
    />
  </FormGroup>

  
  

  <FormGroup >
  
    <Label for="exampleFile"  >
      Upload a file
    </Label>
  
    <Input
   
      id="exampleFile"
      name="file"
      type="file"
      // onChange={saveFile}
    />
  
  </FormGroup>

  <FormGroup>
  <Label for="exampleFile">
    Logo
  </Label>
  <Input
    id="exampleFile"
    name="logo"
    type="file"
    
  />
 
</FormGroup>

 
  
</Form>
<Button style={{background:"#d7363c",color:"white"}} onClick={sendIssuerRequest} >
Submit
</Button>
  </div></div></div></div>
  </div>
   
  )
}

export default Register