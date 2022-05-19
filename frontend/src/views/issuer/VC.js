import React from 'react'
import {
    Button,
    FormGroup,
    Form,
    Input,
    InputGroupAddon,
    InputGroupText,
    InputGroup, Label
  } from "reactstrap";
import {useState, useEffect} from 'react'
//import Sidebar from "components/Sidebar/Sidebar.js";
import {
    Table, Container, Modal,
    Row, Col,
   
    Card, CardHeader, 
  } from "reactstrap";
  import PageHeader from "components/Headers/PageHeader.js"; 
  import VCService from 'services/VCService';

function VC() {
    
    const [did, setDid] = useState("")
    const [id, setId] = useState("")

    const [firstName, setFirstname] = useState("")
    const [familyName, setFamilyname] = useState("")
    const [dateOfBirth, setDateOfBirth] = useState("")

    const [status, setStatus] = useState(0);


    const [vcRequestsList, setvcRequestsList] = useState([]);
    const [didModal, setDidModal] = useState(false);
    const retrieveVcRequestsList = async () => {
        let data = await VCService.getVCRequestList();
    
        setvcRequestsList([...data])
      }
    
      useEffect(() => {
        retrieveVcRequestsList();
      }, [])

      useEffect(() => {
      }, [vcRequestsList])
    const handleVC = async () => {
        try {
            const data = await VCService.createVC(id,did,familyName, firstName, dateOfBirth)
            
            console.log(data)
            CloseDidModal()
            retrieveVcRequestsList()
           
          } catch (err) {
            console.log("error");
          }   
    }

      const OpenDidModal = (item) => {
        console.log(item.did) 
        console.log(item.id)
        setDid(item.did)
        setId(item.id)
        setDidModal(true)
       
      };

  const CloseDidModal = () => {
    setDidModal(false)
  }

  const createVCFailed= async (id) => {
    const done = await VCService.createVCFailed(id)
    if (done) {
      console.log('success')
    }
  }

  const SendFailed = (item) => {
    createVCFailed(item.id)
  }

  return (
    <div>
    <PageHeader />
    <Container className="mt--7" fluid>
      <Row>
        <div className="col">
          <Card className="shadow">
            {/* Header */}
            <CardHeader className="border-0">
              <Row className="align-items-center">
                <Col xs="8">
                  <h3 className="mb-0">Verifiable Credentials Request</h3>               
                </Col>
                <Col xs="4">
                    <Input
                      type="select"
                      id="exampleSelect"
                      name="select"
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="0">Pending</option>
                      <option value="1">Issued</option>
                      <option value="2">Declined</option>
                    </Input>
                  </Col>
              </Row>
            </CardHeader>
            {/* List */}
            <Table className="align-items-center table-flush" responsive>
              <thead className="thead-light">
                <tr>
                  <th scope="col"># </th>
                  <th scope="col">DID </th>
                  <th scope="col">State </th> 
                  <th scope="col">Credential Type </th> 
                  <th scope="col">Actions </th>
                </tr>
              </thead>
              <tbody>{
                vcRequestsList.map((item, index) => {
                  return  item.state === parseInt(status) ? 
                  <tr key={index} >
                    <td>{index + 1}</td>
                    <td>{item.did}</td>
                    <td>{item.state === 0 ? "Pending" : item.state === 1 ? "Issued" : "Declined"}</td>
                    <td>PersonalIDCredential</td>
                    <td>
                    <Button style={{background:"#d7363c",color:"white"}} onClick={() => OpenDidModal(item)}
                    disabled={item.state !== 0 ? true : false}>Create VC</Button>
                    <Button onClick={() => SendFailed(item)} id={item.id + "a"} 
                    disabled={item.state !== 0 ? true : false}>Decline Request</Button>
                    </td>
                  </tr>: ""})
                }</tbody>
            </Table>
          </Card>
        </div>

          <Modal className="modal-dialog-centered" size='lg' isOpen={didModal} toggle={CloseDidModal} >
            <div className="modal-header">
              <h4 className="modal-title" id="modal-title-default">
                Fill in the VC informations
              </h4>
              <button
                aria-label="Close"
                className="close"
                data-dismiss="modal"
                type="button"
                onClick={CloseDidModal}
              >
                <span aria-hidden={true}>×</span>
              </button>
            </div>
            <div className="modal-body">
              <div> 
                <Form role="form">
                <FormGroup>
                  <Label>
                    familyName
                  </Label>
                  <Input
                     onChange={(e) => setFamilyname(e.target.value)}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>
                    firstName
                  </Label>
                  <Input
                     onChange={(e) => setFirstname(e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>
                      dateOfBirth
                  </Label>
                  <Input
                     onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </FormGroup>
            {/* <FormGroup className="mb-3">
            <InputGroup className="input-group-alternative">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  DID
                </InputGroupText>
              </InputGroupAddon>
              <Input
                className="input"
                value={did}
                readOnly
                />
            </InputGroup>
          </FormGroup> */}
  
         {/*  <FormGroup>
            <InputGroup className="input-group-alternative">
              <InputGroupAddon addonType="prepend">
                familyName
              </InputGroupAddon>
              <Input
                className="input"
                onChange={(e) => setFamilyname(e.target.value)}
              />
            </InputGroup>
          </FormGroup>
  
          <FormGroup>
            <InputGroup className="input-group-alternative">
              <InputGroupAddon addonType="prepend">
                firstName
              </InputGroupAddon>
              <Input
                className="input"
                onChange={(e) => setFirstname(e.target.value)}
              />
            </InputGroup>
          </FormGroup>
  
          <FormGroup>
          <InputGroup className="input-group-alternative">
            <InputGroupAddon addonType="prepend">
                dateOfBirth
            </InputGroupAddon>
            <Input
              className="input"
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </InputGroup>
        </FormGroup> */}
    
            <Button className="my-4" color="primary" type="button" onClick={handleVC} >
                Submit
              </Button>
                </Form>
              </div>
            </div>
          </Modal> 

      </Row>

    </Container></div>
  )
}

export default VC