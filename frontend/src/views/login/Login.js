import{Form, FormGroup,Label,Input,Button} from "reactstrap";

import AuthService from "services/AuthService";
import { useHistory } from 'react-router-dom';


import { React,useState } from 'react'    
import Home from "views/home/Home";



function Login() {
  const [did, setDid] = useState("")
  const [password, setPassword] = useState("")
  const history = useHistory();

  const login =async()=>{ 
    try{ 
      const data = await AuthService.login(did,password)
      console.log(data)
      if(data.done===true){
        console.log(data.done)
        history.push('/organization'); 
        sessionStorage.setItem("token",data.x)
      
      }
    }catch{ 
      console.log("error")

    }
  }


  

  
  return (
<div><Home/>
    <div class="container">
    

              
    <div class="row align-items-center vh-100" >
        <div class="col-4 mx-auto" >
            <div class="card shadow border" >
                <div class="card-body  flex-column align-items-center" >
                <Form>
                <FormGroup>
                  <Label for="exampleEmail">
                   Login 
                  </Label>
                  <Input
                    plaintext
                    value="Fill in informations to login"
                  />
                </FormGroup>
              
              
                <FormGroup>
                <Label for="exampleName">
                  Identifier
                </Label>
                <Input
                  id="exampleName"
                  name="name"
                  placeholder="did:exemple:01a2d304q8pmle0"
                  type="text"
                  onChange={(e)=>setDid(e.target.value)}
                  
                />
              </FormGroup>
              
              <FormGroup>
              <Label for="exampleName">
                Password
              </Label>
              <Input
                id="exampleName"
                name="password"
                placeholder="password"
                type="password"
                onChange={(e)=>setPassword(e.target.value)}

              />
  
              </FormGroup>
              <div class=" flex-column  d-flex" >
              
              <Button style={{background:"#d7363c",color:"white"}} onClick={login}>
              Submit
            </Button>

              
            </div>
            <div class=" flex-column  d-flex align-items centers text-center" >
         
              </div>
             
             
              </Form>
             
            
                </div>
            </div>
        </div>
    </div>
</div></div>
    
   
  
   
  )
}

export default Login