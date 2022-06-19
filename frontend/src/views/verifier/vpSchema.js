import {
    Container,
    Row,
    Col,
    Button,
    FormGroup,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Input,
    Card,
    CardHeader,
    Table,
    Modal, ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText
} from "reactstrap";
import PageHeader from "components/Headers/PageHeader";
import {useState, useEffect} from "react";
import {
    Formik,
    Form,
    Field,
    FieldArray,
    ErrorMessage
} from 'formik';
import * as Yup from 'yup';
import IssuerService from "services/IssuerService";
import VcSchemaService from "services/VcSchemaService";
import Select , { Option, ReactSelectProps } from 'react-select'
import AsyncSelect from 'react-select/async';
import VerifierService from "services/VerifierService";
import swal from 'sweetalert';

const VpSchema = (props) => {

    const [vpModal, setVpModal] = useState(false)
    const [issuers, setIssuers] = useState([])
    const [verificationTemplatesList, setverificationTemplatesList] = useState([])

    const [schema, setSchema] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    
    const openModal = async (item) => {
      let data = await VerifierService.resolveVerificationTemplate(item.name)
      let finaleSchema = {
          title : data.title,
          description : data.description,
          verifiableCredential : data.properties.verifiableCredential.items
      }
      setSchema(finaleSchema)
      console.log(schema);
      
      setModalVisible(true) 
    };

    const closeModal = () => {
      setModalVisible(false)
      setSchema({})
    };

    const openVpModal = () => {
        setVpModal(true)
    }

    const ClosevpModal = () => {
        setVpModal(false)
    }

    const retrieveIssuersList = async () => {
      let data = await IssuerService.getIssuers()
      let issuerList = []
      data.forEach(element => {
        issuerList.push({
            value : element.did , label : element.name
        })
      });
      setIssuers(issuerList)
    }

    const retrieveVerificationTemplates = async () => {
        let data = await VerifierService.verificationTemplatesList()
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
    
    const retrieveSchemasList = async (did) => {
        try {
            let data = await VcSchemaService.getSchemasByIssuer(did)
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
        } catch (error) {
            console.log(error);
        }    
    }

    const retrieveSchema = async (did , name) => {
        try {
            let data = await VcSchemaService.resolveSchemaByNameAndIssuer(did, name)
            let elements = data.properties.credentialSubject.properties
            let options = []
            Object.keys(elements).map(function (key, index) {
                if(key !== "id"){
                    let option = {
                        label : key,
                        value : elements[key]
                    }
                    options.push(option)
                }
            });
            return options
        } catch (error) {
            console.log(error);
        }    
    }

    useEffect(() => {
        retrieveVerificationTemplates().then((res) => {
            setverificationTemplatesList(res);
        });
        retrieveIssuersList();
    }, [])

    const initialValues = {
        title: '',
        description: '',
        numberOfCredentials: '',
        credentiels: []
    };

    const validationSchema = Yup.object().shape({
        title :  Yup.string().required(),
        description :  Yup.string().required(),
        numberOfCredentials: Yup.string().required(),
        credentiels: Yup.array().of(Yup.object().shape({
            issuer: Yup.string().required("Issuer is a required field"), 
            credential: Yup.string().required("Credential is a required field"), 
            claims: Yup.array()
        }))
    });

    function getIssuer(did) {
        let data = issuers.filter(issuer => issuer.value === did)
        return data[0].label
    }
 
    function onChangeCredentials(e, field, values, setValues) { // update dynamic form
       
            const credentiels = [...values.credentiels];
            const numberOfCredentials = e.target.value || 0;
            const previousNumber = parseInt(field.value || '0');
                if (previousNumber < numberOfCredentials) {
                    for (let i = previousNumber; i < numberOfCredentials; i++) {
                        credentiels.push({issuer: '', credential: '', claims: []});
                    }
                } else {
                    for (let i = previousNumber; i >= numberOfCredentials; i--) {
                        credentiels.splice(i, 1);
                    }
                } 
                setValues({
                    ...values,
                    credentiels
                });

            // call formik onChange method
            field.onChange(e);
        
    }

    const onSubmit = async (fields) => { 
        let done = await VerifierService.createVerificationSchema(fields)
        if (done) {
            ClosevpModal()
            swal("Verification template created successfully", "", "success");
        }
        else{
            ClosevpModal()
            swal("Something went wrong try again!", "", "error");
        }
    }

    return (
        <>
            <PageHeader/> {/* Page content */}
            <Container className="mt--7" fluid>
                <div>
                    <Row>
                        <Col xs="6">
                            <Button className="btn-icon btn-3" color="secondary" type="button"
                                onClick={openVpModal}>
                                <span className="btn-inner--text">Create Template</span>
                            </Button>
                        </Col>
                        <Col className="text-right" xs="6">
                            <FormGroup>
                                <InputGroup className="input-group-alternative mb-4">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-zoom-split-in"/>
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input className="form-control-alternative" placeholder="Search by name ..." type="text"/>
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
                                        <h3 className="mb-0">List of verification templates</h3>
                                    </Col>
                                </Row>
                            </CardHeader>
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
                                    verificationTemplatesList.map((listValue, index) => {
                                        return (
                                            <tr key={index}>
                                              <td>{index + 1}</td>
                                              <td>{listValue.name}</td>
                                              <td>verification Template of {listValue.name}</td>
                                              <td> 
                                                <Button className="btn-icon btn-3" style={{background:"#d7363c",color:"white"}} type="button"
                                                 onClick={() => openModal(listValue)} >
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
                </Row>
                <Modal className="modal-dialog-centered" size='lg'
                    isOpen={vpModal}
                    toggle={ClosevpModal}>
                    <div className="modal-header">
                        <h4 className="modal-title" id="modal-title-default">
                            Create Verification Template
                        </h4>
                        <button aria-label="Close" className="close" data-dismiss="modal" type="button"
                            onClick={ClosevpModal}>
                            <span aria-hidden={true}>×</span>
                        </button>
                    </div>

                    <Formik initialValues={initialValues}
                        validationSchema={validationSchema}
                        enableReinitialize={false}
                        onSubmit={onSubmit}>
                        {
                        ({errors, values, touched, setValues, setFieldValue, handleChange}) => (
                            <Form>
                                <div className="modal-body">
                                    <div className="mb-3">
                                            <label className="form-label">Verification title</label>
                                            <Field name="title">
                                                {({ field }) => (
                                                    <input {...field} type="text" 
                                                    className={'form-control' + (errors.title && touched.title ? ' is-invalid' : '')} />
                                                )}
                                            </Field>
                                            <ErrorMessage name="title" component="div" className="invalid-feedback"/>
                                    </div> 
                                    <div className="mb-3" >
                                            <label className="form-label">Verification Description</label>
                                            <Field name="description">
                                                {({ field }) => (
                                                    <input {...field} type="textarea" 
                                                    className={'form-control' + (errors.description && touched.description ? ' is-invalid' : '')} />
                                                )}
                                            </Field>
                                            <ErrorMessage name="description" component="div" className="invalid-feedback"/>
                                    </div> 
                                    <div className="text-muted mb-4">
                                        <p>A verification can return as either valid or invalid. Define what constitutes a valid verification below:</p>
                                    </div>
                                    <div className="mb-3">
                                            <label className="form-label">Number of Credentials</label>
                                            <Field name="numberOfCredentials">
                                                {({ field }) => (
                                                    <input autoComplete="off" {...field} type="number"
                                                    className={'form-control' + (errors.numberOfCredentials && touched.numberOfCredentials ? ' is-invalid' : '')} 
                                                    onChange={e => onChangeCredentials(e, field, values, setValues)}/>
                                                )}
                                            </Field>
                                            <ErrorMessage name="numberOfCredentials" component="div" className="invalid-feedback"/>
                                        
                                    </div>
                                    <FieldArray name="credentiels">
                                        {() => (values.credentiels.map((ticket, i) => {
                                            const CredentialErrors = (errors.credentiels?.length && errors.credentiels[i]) || {};
                                            const CredentialTouched = (touched.credentiels?.length && touched.credentiels[i]) || {};
                                            return (
                                                <div key={i} className="list-group list-group-flush">
                                                    <div className="list-group-item">
                                                        <h5 className="card-title">Credential {i + 1}</h5>
                                                        <div className="form-row">
                                                            <div className="form-group col-6">
                                                                <label>Issuer</label>
                                                                <Field name={`credentiels.${i}.issuer`}> 
                                                                {({ field }) => (
                                                                    <Select 
                                                                        name={field.name}
                                                                        options={issuers}
                                                                        value={issuers ? issuers.find(option => option.value === field.value) : ''}
                                                                        onChange={(option: Option) => {
                                                                            setFieldValue(field.name, option.value);
                                                                        }}/>
                                                                )}
                                                                </Field>
                                                                {CredentialErrors.issuer && CredentialTouched.issuer ?
                                                                    <p className="mt-3 mb-0 text-muted text-sm"><span className="text-danger mr-2">
                                                                        {CredentialErrors.issuer}
                                                                    </span></p> 
                                                                : null}
                                                            </div>
                                                            <div className="form-group col-6">
                                                                <label>Claims</label>
                                                                <Field name={`credentiels.${i}.credential`}>
                                                                    {({ field }) => (
                                                                       <AsyncSelect
                                                                        defaultOptions={true}
                                                                        key={`iss-${values.credentiels[i].issuer}`}
                                                                        loadOptions={e => {
                                                                            if(values.credentiels[i].issuer){
                                                                                return retrieveSchemasList(values.credentiels[i].issuer).then((res) => {
                                                                                    let options = []
                                                                                    res.forEach(element => {
                                                                                        options.push({
                                                                                            label: element.name , value: element.name
                                                                                        })
                                                                                    });
                                                                                    return options;
                                                                                });
                                                                            }else {
                                                                                return []
                                                                            }
                                                                       }}
                                                                       onChange={(option) =>{ 
                                                                        setFieldValue(field.name, option.value)
                                                                       }}
                                                                        name={field.name}
                                                                     />
                                                                    )}
                                                                </Field>
                                                                {CredentialErrors.credential && CredentialTouched.credential?
                                                                    <p className="mt-3 mb-0 text-muted text-sm"><span className="text-danger mr-2">
                                                                        {CredentialErrors.credential}
                                                                    </span></p> 
                                                                : null}
                                                            </div>
                                                        </div>
                                                        <div className="form-row">
                                                            <div className="form-group  col-12" >
                                                            <label>Credential</label>
                                                                <Field name={`credentiels.${i}.claims`}>
                                                                    {({ field }) => (
                                                                       <AsyncSelect
                                                                        defaultOptions={true}
                                                                        isMulti
                                                                        key={`cred-${values.credentiels[i].credential}`}
                                                                        loadOptions={e => {
                                                                            if(values.credentiels[i].issuer && values.credentiels[i].credential){
                                                                                return retrieveSchema(values.credentiels[i].issuer, values.credentiels[i].credential)
                                                                            }
                                                                            else{
                                                                                return []
                                                                            }
                                                                        }}
                                                                        onChange={(option) =>{ 
                                                                            setFieldValue(field.name, option)
                                                                        }}
                                                                        name={field.name}
                                                                     />
                                                                    )}
                                                                </Field>
                                                                {CredentialErrors.claims && CredentialTouched.claims?
                                                                    <p className="mt-3 mb-0 text-muted text-sm"><span className="text-danger mr-2">
                                                                        {CredentialErrors.claims}
                                                                    </span></p> 
                                                                : null}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }))}
                                    </FieldArray>
                                    <Button className="my-4" color="primary" type="submit">
                                        Create
                                    </Button>
                                </div>
                            </Form>
                        )
                    } 
                    </Formik>
                </Modal>
                <Modal className="modal-dialog-centered" size='lg'
                         isOpen={modalVisible} toggle={closeModal} >
                        <div className="modal-header">
                            <h4 className="modal-title" id="modal-title-default"
                            style={{textTransform: "uppercase"}}>
                              Verification Template {schema.title}
                            </h4>
                            <button
                                aria-label="Close" className="close" data-dismiss="modal" type="button"
                                onClick={closeModal}
                            >
                                <span aria-hidden={true}>×</span>
                            </button>
                        </div>  
                        <div className="modal-body">
                        <div>
                                                    <h3>
                                                    Title : {schema.title}
                                                    </h3>
                                                    <p>
                                                    <b>Description : {schema.description} </b>
                                                    </p>
                                                </div>
                            <ListGroup>
                            {  schema.verifiableCredential ? 
                            (schema.verifiableCredential.map((item, index) => {
                              return (    
                                <ListGroupItem key={index} >
                                    <ListGroupItemHeading>
                                       Credential {index +1} :  {item.title}
                                       <br/>
                                       Issuer : {getIssuer(item.issuer)}
                                    </ListGroupItemHeading>
                                    <ListGroupItemText>
                                    <div style={{margin : "20px", marginTop : "0px"}}>
                                        {  item.properties.credentialSubject.properties ? 
                                            ( Object.entries(item.properties.credentialSubject.properties).map((element, index) => {
                                                console.log(element);
                                            return ( 
                                                <Row>
                                                <div>
                                                    <span className='headingProp'>
                                                    {element[0]}
                                                    </span>
                                                    <span className='descriptionProp'>
                                                   {element[1].description}
                                                    </span>
                                                </div>
                                                </Row>
                                            );
                                            }))
                                        : null}
                                        </div> 
                                    </ListGroupItemText>
                                </ListGroupItem>
                                );
                                }))
                            : null}
                            </ListGroup>
                        <div>
                        </div>
                        </div>
                    </Modal>   
            </Container>
        </>
    );
};

export default VpSchema;
