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
    Modal
} from "reactstrap";
import PageHeader from "components/Headers/PageHeader";
import {useState, useEffect} from "react";
import {
    Formik,
    Form,
    Field,
    FieldArray,
    ErrorMessage,
    FastField
} from 'formik';
import * as Yup from 'yup';
import IssuerService from "services/IssuerService";
import VcSchemaService from "services/VcSchemaService";
const VpSchema = (props) => {

    const [vpModal, setVpModal] = useState(false)
    const [issuers, setIssuers] = useState([])
    const openVpModal = () => {
        setVpModal(true)
    }

    const ClosevpModal = () => {
        setVpModal(false)
    }

    

    const retrieveIssuersList = async () => {
      let data = await IssuerService.getIssuers()
      setIssuers(data)
      console.log("issuers",issuers);
    }
    
    

    const retrieveSchemasList = async (did) => {
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
    }

    useEffect(() => {
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
            credential: Yup.object().required("Credential is a required field"), 
            claims: Yup.array()
        }))
    });
 
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

    function onSubmit(fields) { // display form field values on success
        alert('SUCCESS!! :-)\n\n' + JSON.stringify(fields, null, 4));
    }



   async function getCreds(issuer) {


        console.log("ISSUSER ID" ,issuer)
        
     
        console.log('init val', initialValues)

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
                                <tbody></tbody>
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
                        //validationSchema={validationSchema}
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
                                    <div className="mb-3">
                                            <label className="form-label">Verification Description</label>
                                            <Field name="description">
                                                {({ field }) => (
                                                    <input {...field} type="text"
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
                                                    <input {...field} type="text"
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
                                                                    <select  {...field} 
                                                                    onChange={async (e) => {
                                                                        console.log("Changing issuer val");
                                                                        const { value } = e.target;
                                                                        setFieldValue(`credentiels.${i}.issuer`, value);
                                                                        setFieldValue(`credentiels.${i}.credential`, ""); 
                                                                        await retrieveSchemasList(value).then((res) => {
                                                                            console.log("res",res);
                                                                            setFieldValue(`credentiels.${i}.credential`, res);
                                                                        });
                                                                    }}
                                                                    className={'form-control' + (CredentialErrors.issuer && CredentialTouched.issuer ? ' is-invalid' : '')}>
                                                                        <option value=""></option>
                                                                        {issuers.map(item => 
                                                                            <option key={item.id} value={item.did}>{item.name}</option>
                                                                        )}
                                                                    </select>
                                                                )}
                                                                </Field>
                                                                <ErrorMessage name={`credentiels.${i}.issuer`} component="div" className="invalid-feedback" />
                                                            </div>
                                                            <div className="form-group col-6">
                                                                <label>Credential</label>
                                                                <Field as="select" name={`credentiels.${i}.credential`}  
                                                                /* className={'form-control ' + (CredentialErrors.credential && CredentialTouched.credential ? 'is-invalid' : '')}
                                                                
                                                                onChange={ e => {
                                                                    console.log(e.target.value)
                                                                    setTimeout(() => {
                                                                        
                                                                        setFieldValue(`credentiels.${i}.credential`, e.target.value, false)

                                                                        console.log(values)
                                                                    }, 1000)
                                                                }} */
                                                                
                                                                >
                                                                    {({ field }) => (
                                                                    <select  {...field} value={values.credentiels[i].credential}
                                                                    onChange={(e) => {
                                                                        console.log("reees",e.target.value)
                                                                        setFieldValue(`credentiels.${i}.credential`,e.target.value, false)
                                                                    }}
                                                                     className={'form-control ' + (CredentialErrors.credential && CredentialTouched.credential ? 'is-invalid' : '')}
                                                                    >
                                                                        <option value=""></option>
                                                                    
                                                                        {
                                                                       

                                                                        

                                                                        
                                                                        
                                                                        /* {values.credentiels[i].credential && values.credentiels[i].credential.map((item , index)  => {

                                                                            
                                                                            return ( <option key={index} value={item.path}>{item.name}</option> )
                                                                        })} */}
                                                                    </select>
                                                                    )}
                                                                </Field>
                                                                <ErrorMessage name={`credentiels.${i}.credential`} component="div" className="invalid-feedback" />
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
            </Container>
        </>
    );
};

export default VpSchema;
