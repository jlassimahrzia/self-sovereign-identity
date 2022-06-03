import React from 'react'
import{Form, FormGroup,Label,Input,Button,Col,Card,CardBody,InputGroup,InputGroupAddon,InputGroupText} from "reactstrap";
import { useParams } from "react-router-dom";
import jwt from 'jwt-decode' // import dependency
import {useState} from 'react'
import AuthService from 'services/AuthService';
import { useHistory } from 'react-router-dom';


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
      const data = await AuthService.sendAuthCreds(password,did)
      console.log(data)
      history.push('/auth/login'); 
    }catch{ 
      console.log("error")

    }
  }

  return (
    <>
     
    
    
    
{ok? 

    <Col lg="5" md="7">
    <Card className="bg-secondary shadow border-0">
      
    <CardBody className="px-lg-5 py-lg-5">
      <div className="text-center text-muted mb-4">
        <small>Sign up with credentials</small>
      </div>
      <Form role="form">
    <FormGroup>
    <InputGroup className="input-group-alternative">
    <InputGroupAddon addonType="prepend">
      <InputGroupText>
        <i className="ni ni-lock-circle-open" />
      </InputGroupText>
    </InputGroupAddon>
    <Input
      id="exampleName"
      name="password"
      placeholder="password"
      type="password"
      onChange={(e) => saveFile(e.target.value)}
    /></InputGroup>
    </FormGroup> 
    </Form>
          </CardBody>
        </Card>
      </Col>
    
    
    : <Col lg="5" md="7">
    <Card className="bg-secondary shadow border-0">
      
    <CardBody className="px-lg-5 py-lg-5">
      <div className="text-center text-muted mb-4">
        <small>Sign up with credentials</small>
      </div>
      <Form role="form">
<FormGroup>
<InputGroup className="input-group-alternative">
    <InputGroupAddon addonType="prepend">
      <InputGroupText>
        <i className="ni ni-lock-circle-open" />
      </InputGroupText>
    </InputGroupAddon>
<Input
  id="exampleName"
  name="newpassword"
  placeholder="Choose a password"
  type="password"
  value={password}
  onChange={(e) => button1(e.target.value)}

/></InputGroup>
</FormGroup>
<FormGroup>
<InputGroup className="input-group-alternative">
    <InputGroupAddon addonType="prepend">
      <InputGroupText>
        <i className="ni ni-lock-circle-open" />
      </InputGroupText>
    </InputGroupAddon>
<Input
  id="exampleName"
  name="newpassword"
  placeholder="Confirm the password"
  type="password"
  value={newpassword}
  onChange={(e) => button(e.target.value)}

/></InputGroup>

</FormGroup> 
<Button  disabled={disabled} style={{background:"#d7363c",color:"white"}} onClick={sendAuthCreds} >
  Submit
</Button>
</Form>
</CardBody>
</Card>
</Col>
}





      </>
  )
}

export default Password