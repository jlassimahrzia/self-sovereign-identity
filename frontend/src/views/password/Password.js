import React from 'react'
import{Form, FormGroup,Label,Input,Button} from "reactstrap";
import { useParams } from "react-router-dom";
import jwt from 'jwt-decode' // import dependency
import {useState} from 'react'
import AuthService from 'services/AuthService';
import { useHistory } from 'react-router-dom';
import Home from 'views/home/Home';

function Password() {
  const history = useHistory();
    const  token  = useParams();
    console.log(jwt(token.id).identifier)
    console.log(jwt(token.id).result)
    
    const [ok, setOK] = useState(true)
    const [disabled, setDisabled] = useState(true)
    const [did, setDid]=useState("")
    const [num, setNum] = useState("")
    const [password, setPassword] = useState("")
    const [newpassword, setNewpassword] = useState("")

  const saveFile = (e) => {
    if(e===jwt(token.id).result){
        setOK(false)
    }
   setNum(e);
   setDid(jwt(token.id).identifier)
   
   console.log(e,num,ok)
  };

  const button1 = (e) => {
    if(e===newpassword){
      setDisabled(false)
    }else{
      setDisabled(true)

    }
 setPassword(e)
};

  const button = (e) => {
      if(e===password){
        setDisabled(false)
      }else{
        setDisabled(true)

      }
   setNewpassword(e)
  };

  const sendAuthCreds = async()=>{ 
    try{ 
      const data = await AuthService.sendAuthCreds(did,password)
      console.log(data)
      history.push('/login'); 
    }catch{ 
      console.log("error")

    }
  }

  return (
    <div><Home/>
    <div class="row align-items-center vh-100" >
        <div class="col-3 mx-auto" >
            <div class="card shadow border" >
                <div class="card-body d-flex flex-column align-items-center" >
    
    
    
{ok? 
    <Form> 
    <FormGroup>
    <Label for="exampleName">
      Password
    </Label>
    <Input
      id="exampleName"
      name="password"
      placeholder="password"
      type="password"
      onChange={(e) => saveFile(e.target.value)}
    />
    </FormGroup> 
    </Form>
    
    
    : <Form> 
<FormGroup>
<Label for="exampleName">
  New Password
</Label>
<Input
  id="exampleName"
  name="newpassword"
  placeholder="password"
  type="password"
  value={password}
  onChange={(e) => button1(e.target.value)}

/>
</FormGroup>
<FormGroup>
<Label for="exampleName">
  Confirm Password
</Label>
<Input
  id="exampleName"
  name="newpassword"
  placeholder="password"
  type="password"
  value={newpassword}
  onChange={(e) => button(e.target.value)}

/>

</FormGroup> 
<Button  disabled={disabled} style={{background:"#d7363c",color:"white"}} onClick={sendAuthCreds} >
  Submit
</Button>
</Form>}





</div></div></div>
    
    </div></div>
  )
}

export default Password