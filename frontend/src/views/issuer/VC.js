import React from 'react'
import {
    Button,
    Input,
} from "reactstrap";
import {useState, useEffect} from 'react'


import {
    Table, Container,
    Row, Col,  
    Card, CardHeader, 
  } from "reactstrap";
  import PageHeader from "components/Headers/PageHeader.js"; 
  import VCService from 'services/VCService';
  import jwt from 'jwt-decode'

function VC() {
    
    const [status, setStatus] = useState(0);


    const [vcRequestsList, setvcRequestsList] = useState([]);
    const retrieveVcRequestsList = async () => {
      //let a = sessionStorage.getItem("token")
      let didIssuer = (jwt(sessionStorage.getItem("token")) ).res[0].did

        let data = await VCService.getVCRequestList(didIssuer);
    
        setvcRequestsList([...data])
      }
    
      useEffect(() => {
        retrieveVcRequestsList();
      }, [])

      useEffect(() => {
        console.log((jwt(sessionStorage.getItem("token")) ))
      }, [vcRequestsList])

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
                  
                  <th scope="col">Credential Type </th> 
                  <th scope="col">State </th> 
                  <th scope="col">Actions </th>
                </tr>
              </thead>
              <tbody>{
                vcRequestsList.map((item, index) => {
                  return  item.state === parseInt(status) ? 
                  <tr key={index} >
                    <td>{index + 1}</td>
                    <td>{item.did_holder}</td>
                    <td>{item.vc_name}</td>
                    <td>{item.state === 0 ? "Pending" : item.state === 1 ? "Issued" : "Declined"}</td>
                    
                    <td>
                   
                    <Button id={item.id + "a"} 
                    disabled={item.state !== 0 ? true : false}>Decline Request</Button>
                    </td>
                  </tr>: ""})
                }</tbody>
            </Table>
          </Card>
        </div>


      </Row>

    </Container></div>
  )
}

export default VC