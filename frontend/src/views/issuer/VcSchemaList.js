import {useState, useEffect} from 'react'
import {
    Container,
    Row,
    Card,
    CardHeader,
    Table,
    Col, Button, Modal,
    FormGroup,
    InputGroup,
    InputGroupAddon,
    InputGroupText,Input
} from "reactstrap";
import PageHeader from "components/Headers/PageHeader.js";
import VcSchemaService from 'services/VcSchemaService';

function VcSchemaList() {

    const [schema, setSchema] = useState({});
    const [schemasList, setSchemasList] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [tab, settab] = useState([])
    
    const openModal = async (item) => {
      let data = await VcSchemaService.resolveSchema(item.name)
      console.log(data.properties.credentialSubject.properties);
      let properties = Object.entries(data.properties.credentialSubject.properties);
      let finaleSchema = {
          title : data.title,
          description : data.description,
          properties : properties
      }
      setSchema(finaleSchema)
      setModalVisible(true) 
    };

    const closeModal = () => {
      setModalVisible(false)
      setSchema({})
    };

    const retrieveSchemasList = async () => {
        let data = await VcSchemaService.getSchemas()
        if(data.length > 0){
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
        else {
          return []
        }
    }

    useEffect(() => {
      retrieveSchemasList().then((res) => {
        setSchemasList(res);
      });
      retrieveSchemasList().then((res) => {
        settab(res);
      });
    }, [])

    const search = async (e) => {
      let keyword = e.target.value
      let data = tab.filter(template => template.name.includes(keyword))
      setSchemasList(data)
      if(!e.target.value)
        await retrieveSchemasList().then((res) => {
          setSchemasList(res);
        });
    }

    return (
        <>
            <PageHeader/>
            <Container className="mt--7" fluid>
                  <div>
                    <Row>
                        <Col xs="6"></Col>
                        <Col className="text-right" xs="6">
                            <FormGroup>
                                <InputGroup className="input-group-alternative mb-4">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-zoom-split-in"/>
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input className="form-control-alternative" placeholder="Search by name ..." type="text"
                                    onChange={(e) => search(e)}/>
                                </InputGroup>
                            </FormGroup>
                        </Col>
                    </Row>
                </div>
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
                                                <Button className="btn-icon btn-3" style={{background:"#d7363c",color:"white"}} type="button"
                                                onClick={() => openModal(listValue)}>
                                                  <span className="btn-inner--icon">
                                                    <i className="ni ni-zoom-split-in" />
                                                  </span>
                                                  <span className="btn-inner--text">Show details</span>
                                                </Button>
                                              </td>
                                            </tr>
                                        );
                                    })
                                }</tbody>
                            </Table>
                        </Card>
                    </div>
                    <Modal className="modal-dialog-centered"
                        style={{width: "500px"}} isOpen={modalVisible} toggle={closeModal} >
                        <div className="modal-header">
                            <h4 className="modal-title" id="modal-title-default"
                            style={{textTransform: "uppercase"}}>
                              {schema.title}
                            </h4>
                            <button
                                aria-label="Close" className="close" data-dismiss="modal" type="button"
                                onClick={closeModal}
                            >
                                <span aria-hidden={true}>×</span>
                            </button>
                        </div>  
                        <div className="modal-body">
                          <div style={{margin : "20px", marginTop : "0px"}}>
                          {  schema.properties ? 
                            (schema.properties.map((item, index) => {
                              return ( 
                                <Row>
                                  <div>
                                    <span className='headingProp'>
                                      {item[0]}
                                    </span>
                                    <span className='descriptionProp'>
                                      { item[1].description ?  item[1].description : null } 
                                    </span>
                                  </div>
                                </Row>
                              );
                            }))
                          : null}
                          </div>
                        </div>
                    </Modal>                         
                </Row>
            </Container>
        </>
    );
};

export default VcSchemaList;
