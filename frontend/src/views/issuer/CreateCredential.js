import {useState, useEffect} from 'react'
import {
    Container,
    Row,
    Card,
    CardBody,
    CardHeader,
    Table,
    Col, Button, Modal
} from "reactstrap";
import PageHeader from "components/Headers/PageHeader.js";
import Form from "@rjsf/bootstrap-4";
import VcSchemaService from 'services/VcSchemaService';

function CreateCredential() {

    const[vcModal, setVcModal] = useState(false)
    const[item, setItem] = useState({})

    const [schema, setSchema] = useState({});
    const [schemasList, setSchemasList] = useState([]);

    const retrieveSchemasList = async () => {
        let data = await VcSchemaService.getSchemas()
        let finalRes = [];
        data.forEach(schemaRes => {
            let name = schemaRes[0];
            let path = schemaRes[1];
            let result = {
                name,
                path
            }
            finalRes.push(result);
        });
        return finalRes;
    }

    useEffect(() => {
      retrieveSchemasList().then((res) => {
        setSchemasList(res);
        console.log("data", schemasList);
      });
    }, [])

    useEffect(() => {}, [schemasList])

    const openVcModal = async (item) => {
      setItem(item)
      setVcModal(true)
      let schema = await VcSchemaService.resolveSchema(item.name)
      setSchema(schema.vcSchema.properties.credentialSubject)
      console.log("schema",schema.vcSchema.properties.credentialSubject)
      console.log("item",item)
    }

    const ClosevcModal = () => {
      setVcModal(false)
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
                                        <h3 className="mb-0">Verifiable Credentials Schemas</h3>
                                    </Col>
                                </Row>
                            </CardHeader>
                            {/* List */}
                            <Table className="align-items-center table-flush" responsive>
                                <thead className="thead-light">
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Description</th>
                                        <th scope="col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>{
                                    schemasList.map((listValue, index) => {
                                        return (
                                            <tr key={index}>
                                              <td>{index + 1}</td>
                                              <td>{listValue.name}</td>
                                              <td>Schema of {listValue.name}</td>
                                              <td> 
                                                <Button style={{background:"#d7363c",color:"white"}} type="button"
                                                onClick={() => openVcModal(listValue)}>
                                                  Create VC
                                                </Button>
                                              </td>
                                            </tr>
                                        );
                                    })
                                }</tbody>
                            </Table>
                        </Card>
                    </div>
                  
                    <Modal className="modal-dialog-centered" size='lg' isOpen={vcModal} toggle={ClosevcModal} >
                    <div className="modal-header">
                      <h4 className="modal-title" id="modal-title-default">
                        Fill in the VC informations
                      </h4>
                      <button
                        aria-label="Close"
                        className="close"
                        data-dismiss="modal"
                        type="button"
                        onClick={ClosevcModal}
                      >
                        <span aria-hidden={true}>×</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      <Form schema={schema} />
                    </div>
                  </Modal>                  
                </Row>
            </Container>
        </>
    );
};

export default CreateCredential;
