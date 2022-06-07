import { Fragment, useState, useEffect } from 'react'
import {
  Table, Container,
  Row, Col,
  Button,
  Card, CardHeader, Input
} from "reactstrap";
import PageHeader from "components/Headers/PageHeader.js";
import DidService from 'services/DidService';
import swal from 'sweetalert';

const CreateIdentity = () => {

  const [didRequestsList, setdidRequestsList] = useState([])

  const [status, setStatus] = useState(0)

  const retrieveDidRequestsList = async () => {
    let data = await DidService.getdidRequestList();
    setdidRequestsList([...data])
  }

  useEffect(() => {
    retrieveDidRequestsList();
  }, [])

  useEffect(() => {
    retrieveDidRequestsList();
  }, [didRequestsList])

  const createIdentity1 = async (publickey, email, id) => {
    const data = await DidService.createIdentity(publickey, email, id)
    if (data) {
      await DidService.mappingDidToHash(data.cid.path, data.identifier)      
      const ddo = await DidService.resolve(data.identifier)
      if(ddo){
        swal("A new holder has been created successfully!", "", "success");
      }
      else{
        swal("Something went wrong try again!", "", "error");
      }
    }
  }

  const createIdentity2 = (item) => {
    createIdentity1(item.publickey, item.email, item.id)

  };

  const createIdentityFailed = async (email, id) => {
    const done = await DidService.createIdentityFailed(email, id)
    if (done) {
      swal("Holder request declined!", "", "warning");
    }
    else{
        swal("Something went wrong try again!", "", "error");
    }
  }
  const SendFailed = (item) => {
    createIdentityFailed(item.email, item.id)
  }

  return (
    <>
      <PageHeader/>
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              {/* Header */}
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">Holder DID Request</h3>
                  </Col>
                  <Col xs="4">
                    <Input
                      type="select"
                      id="exampleSelect"
                      name="select"
                      onChange={(e) => setStatus(e.target.value)}>
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
                    <th scope="col">#</th>
                    <th scope="col">Address</th>
                    <th scope="col">Public Key</th>
                    <th scope="col">Name</th>
                    <th scope="col">Lastname</th>
                    <th scope="col">Email</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>{didRequestsList.map((item, index) => {
                    return item.state === parseInt(status) ?
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.address}</td>
                        <td>{item.publickey}</td>
                        <td>{item.firstname}</td>
                        <td>{item.lastname}</td>
                        <td>{item.email}</td>
                        <td>{item.state === 0 ? "Pending" : item.state === 1 ? "Issued" : "Declined"}</td>
                        <td>
                          <Button style={{background:"#d7363c",color:"white"}} id={item.id} disabled={item.state !== 0 ? true : false}
                            onClick={() => createIdentity2(item)}>Create Identity</Button>
                          <Button id={item.id + "a"} disabled={item.state !== 0 ? true : false} onClick={() => SendFailed(item)}>Decline Request</Button>
                        </td>
                      </tr> : ""
                })}</tbody>
              </Table>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default CreateIdentity;
