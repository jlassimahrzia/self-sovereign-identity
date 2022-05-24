import { useHistory } from 'react-router-dom';


import { React,useState } from 'react' 
import AuthService from "../../services/AuthService";
import {
  Button,
  Card,
 
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Row,
  Col,
} from "reactstrap";

const Login = () => {
  const [did, setDid] = useState("")
  const [password, setPassword] = useState("")
  const history = useHistory();


  const login =async()=>{ 
    try{ 
      const data = await AuthService.login(did,password)
      console.log(data)
      if(data.done===true){
        console.log(data.done)
        
        console.log(data)
        sessionStorage.setItem("token",data.x)
        history.push('/organization'); 
      
      }
    }catch{ 
      console.log("error")

    }
  }



  return (
    <>
      <Col lg="5" md="7" >
        <Card className=" shadow border-0" style={{borderColor:"#d7363c"}}>
          
          <CardBody className="px-lg-5 py-lg-5">
            <div className="text-center text-muted mb-4">
              <small>Sign in with credentials</small>
            </div>
            <Form role="form">
              <FormGroup className="mb-3">
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-email-83" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="did"
                    type="email"
                    autoComplete="new-email"
                    onChange={(e)=>setDid(e.target.value)}
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Password"
                    type="password"
                    autoComplete="new-password"
                    onChange={(e)=>setPassword(e.target.value)}
                  />
                </InputGroup>
              </FormGroup>
              
              <div className="text-center">
                <Button className="my-4" style={{background:"#d7363c",color:"white"}} type="button" onClick={login}>
                  Sign in
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
        <Row className="mt-3">
          <Col xs="6">
            <a
              className="text-light"
              href="#pablo"
              onClick={(e) => e.preventDefault()}
            >
              <small>Forgot password?</small>
            </a>
          </Col>
          <Col className="text-right" xs="6">
            <a
              className="text-light"
              href="#pablo"
              onClick={(e) => e.preventDefault()}
            >
              <small>Create new account</small>
            </a>
          </Col>
        </Row>
      </Col>
    </>
  );
};

export default Login;
