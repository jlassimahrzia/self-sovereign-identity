import {
    Button,
    Card,
    CardBody,
    FormGroup,
    Form,
    Input,
    Label,
    Col, CustomInput
} from "reactstrap";
import React from 'react'
import {useState, useEffect} from 'react'
import swal from 'sweetalert';
import RegisterService from '../../services/RegisterService';
import { useFormik } from 'formik'
import * as Yup from 'yup'
const Register = () => {

    const [pdfFile, setpdfFile] = useState(null);
    const [PdfError, setPdfError] = useState(null);
    
    const [image, setImage] = useState(null);
    const [FileError, setFileError] = useState(null); // For image error
    
    const [logoName, setlogoName] = useState('')
    const [docName, setdocName] = useState('')

    useEffect(() => {
        setlogoName('')
        setdocName('')
    }, [logoName, docName])
    

    const handleImage = (e) => {
        setFileError(null);
        let files = e.target.files || e.dataTransfer.files;
        if (!files.length) {
            return;
        }
        else if ((files[0].type !== "image/jpeg") && (files[0].type !== "image/png")) {
            setFileError('.png, .jpeg or .jpg images are only  accepted');
            return;
        }
        else if (files[0].size > 20e6) {
            setFileError('Very large Image - Max size = 2MB');
            return;
        }
        setImage(e.target.files[0]); 
        if(e.target.files[0].name)
            setlogoName(e.target.files[0].name)
    }

    const handleInputDocChange = (event) => {
        let files = event.target.files;
        if (!files.length) {
            return;
        }
        else if (files[0].type !== "application/pdf") {
            setPdfError('.pdf documents only accepted');
            return;
        }
        else if (files[0].size > 20e6) {
            setPdfError('Very large document - Max size = 2MB');
            return;
        }
        setdocName(files[0].name)
        setPdfError(null)
        setpdfFile(event.target.files[0]);
    }

    const validationSchema = Yup.object({
        type : Yup.string().required(),
        name : Yup.string().required(),
        email : Yup.string().email().required(),
        category :  Yup.string().required(),
        domain :  Yup.string().required(),
        governorate :  Yup.string().required(),
        description :  Yup.string().required(),
        location :  Yup.string().required(),
        url : Yup.string().url().required(),
        phone : Yup.number(8).required().positive(),
        creationDate : Yup.date().required() 
    })

    const AddForm = useFormik({
        initialValues: {
            type : "issuer",
            name : '',
            email : '',
            category : '',
            domain : '',
            governorate : '',
            description : '',
            location : '',
            url : '',
            phone : '',
            creationDate : ''
        },
        onSubmit: async (values, submitProps) => {
            const formData = new FormData();
            formData.append("files", image);
            formData.append("files", pdfFile);
            const done = await RegisterService.sendIssuerRequest(values, formData)
            if(done){
                swal("Your registration process is done!", "You will recieve an email if your request is accepted!", "success");
                setImage(null)
                setlogoName(null)
                setpdfFile(null)
                setdocName(null)
                setFileError(null)
                setPdfError(null)
                submitProps.resetForm();
            }
            else{
                swal("Registration failed!", "Try Again!", "error");
                
                submitProps.resetForm();
            }
        },
        validationSchema
    })

    return (
        <>
            <Col lg="6" md="8">
                <Card className="bg-secondary shadow border-0">

                    <CardBody className="px-lg-5 py-lg-5">
                        <div className="text-center text-muted mb-4">
                            <h3>Becoming an IdentityTN Issuer OR Verifier </h3>
                            <p>Send your request to IdentityTN team to discuss your needs and the steps involved in becoming an issuer or verifier.</p>
                        </div>
                        <Form onSubmit={AddForm.handleSubmit}>
                            <FormGroup>
                                <Label for="category">
                                    Type
                                </Label>
                                <Input type="select"
                                name="type" id="type"
                                {...AddForm.getFieldProps('type')}
                                >
                                    <option hidden>Select ...</option>
                                    <option value="issuer">Issuer</option>
                                    <option value="verifier">Verifier</option>
                                </Input>
                                {AddForm.errors.type && AddForm.touched.type ?
                                <p className="mt-3 mb-0 text-muted text-sm"><span className="text-danger mr-2">
                                    <i className="ni ni-fat-remove" /> {AddForm.errors.type}
                                </span></p> : null}
                            </FormGroup>
                            <FormGroup>
                                <Label for="name">
                                    Name
                                </Label>
                                <Input placeholder="Name" type="text"
                                name="name" id="name"
                                {...AddForm.getFieldProps('name')}
                                />
                                {AddForm.errors.name && AddForm.touched.name ?
                                <p className="mt-3 mb-0 text-muted text-sm"><span className="text-danger mr-2">
                                    <i className="ni ni-fat-remove" /> {AddForm.errors.name}
                                </span></p> : null}
                            </FormGroup>
                            <FormGroup>
                                <Label for="email">
                                    Email
                                </Label>
                                <Input placeholder="email@example.com" type="email" autoComplete="new-email"
                                name="email" id="email"
                                {...AddForm.getFieldProps('email')}
                                />
                                {AddForm.errors.email && AddForm.touched.email ?
                                <p className="mt-3 mb-0 text-muted text-sm"><span className="text-danger mr-2">
                                    <i className="ni ni-fat-remove" /> {AddForm.errors.email}
                                </span></p> : null}
                            </FormGroup>
                            {AddForm.values.type === "issuer" ? <FormGroup>
                                <Label for="category">
                                    Organization Category
                                </Label>
                                <Input type="select"
                                name="category" id="category"
                                {...AddForm.getFieldProps('category')}
                                >
                                    <option hidden>Select ...</option>
                                    <option value="Entreprise publique">Entreprise publique</option>

                                    <option value="Etablissement public à caractère non administratif">Etablissement public à caractère non administratif</option>

                                    <option value="Etablissement public à caractère non administratif assimilé à une entreprise publique">Etablissement public à caractère non administratif assimilé à une entreprise publique</option>

                                    <option value="Etablissement public de santé">Etablissement public de santé</option>

                                </Input>
                                {AddForm.errors.category && AddForm.touched.category ?
                                <p className="mt-3 mb-0 text-muted text-sm"><span className="text-danger mr-2">
                                    <i className="ni ni-fat-remove" /> {AddForm.errors.category}
                                </span></p> : null}
                            </FormGroup> :
                            <FormGroup>
                                <Label for="category">
                                    Organization Category
                                </Label>
                                <Input type="text"
                                name="category" id="category" {...AddForm.getFieldProps('category')}/>
                                {AddForm.errors.category && AddForm.touched.category ?
                                <p className="mt-3 mb-0 text-muted text-sm"><span className="text-danger mr-2">
                                    <i className="ni ni-fat-remove" /> {AddForm.errors.category}
                                </span></p> : null}
                            </FormGroup>}
                            {AddForm.values.type === "issuer" ?
                            <FormGroup>
                                <Label for="domain">
                                    Organization Domain
                                </Label>
                                <Input type="select" name="domain" id="domain"
                                {...AddForm.getFieldProps('domain')}>
                                    <option hidden>Select ...</option>
                                    <option value="Affaires foncières">Affaires foncières</option>

                                    <option value="Affaires municipales">Affaires municipales</option>

                                    <option value="Affaires religieuses">Affaires religieuses</option>

                                    <option value="Affaires sociales">Affaires sociales</option>

                                    <option value="Agriculture">Agriculture</option>

                                    <option value="Agriculture et pêche">Agriculture et pêche</option>

                                    <option value="Artisanat">Artisanat</option>

                                    <option value="Assurance">Assurance</option>

                                    <option value="Banques">Banques</option>

                                    <option value="Caisses sociales">Caisses sociales</option>

                                    <option value="Commerce">Commerce</option>

                                    <option value="Communication">Communication</option>

                                    <option value="Communication audio-visuelle">Communication audio-visuelle</option>

                                    <option value="Culture">Culture</option>

                                    <option value="Défense">Défense</option>

                                    <option value="Développement Régional et Local">Développement Régional et Local</option>

                                    <option value="Diplomatie">Diplomatie</option>

                                    <option value="Domaines de l'Etat">Domaines de l'Etat</option>

                                    <option value="Domaines de l'Etat affaires foncières">Domaines de l'Etat affaires foncières</option>

                                    <option value="Douane">Douane</option>

                                    <option value="Education">Education</option>

                                    <option value="Emploi">Emploi</option>

                                    <option value="Energie">Energie</option>

                                    <option value="Enfant">Enfant</option>

                                    <option value="Enseignement supérieur">Enseignement supérieur</option>

                                    <option value="Enseignement supérieur et recherche">Enseignement supérieur et recherche</option>

                                    <option value="Environnement">Environnement</option>

                                    <option value="Equipement">Equipement</option>

                                    <option value="Equipement et habitat">Equipement et habitat</option>

                                    <option value="Famille">Famille</option>

                                    <option value="Finance">Finance</option>

                                    <option value="Formation Professionnelle">Formation Professionnelle</option>

                                    <option value="Habitat">Habitat</option>

                                    <option value="Handicapé">Handicapé</option>

                                    <option value="Industrie">Industrie</option>

                                    <option value="Investissement et Coopération Internationale">Investissement et Coopération Internationale</option>

                                    <option value="Jeunesse">Jeunesse</option>

                                    <option value="Jeunesse et sport">Jeunesse et sport</option>

                                    <option value="Justice">Justice</option>

                                    <option value="Mines">Mines</option>

                                    <option value="Pêche">Pêche</option>

                                    <option value="Préservation du patrimoine">Préservation du patrimoine</option>

                                    <option value="Presse écrite">Presse écrite</option>

                                    <option value="Promotion de l'agriculture">Promotion de l'agriculture</option>

                                    <option value="Recherche scientifique">Recherche scientifique</option>

                                    <option value="Ressouces Hydrauliques">Ressouces Hydrauliques</option>

                                    <option value="Santé">Santé</option>

                                    <option value="Services divers">Services divers</option>

                                    <option value="Société civile">Société civile</option>

                                    <option value="Solidarité">Solidarité</option>

                                    <option value="Souveraineté">Souveraineté</option>

                                    <option value="Sport">Sport</option>

                                    <option value="Sûreté nationale">Sûreté nationale</option>

                                    <option value="Technlogie de communication">Technlogie de communication</option>

                                    <option value="Technologie">Technologie</option>

                                    <option value="Tourisme">Tourisme</option>

                                    <option value="Transport">Transport</option>

                                    <option value="Transport aérien">Transport aérien</option>

                                    <option value="Transport ferrovier">Transport ferrovier</option>

                                    <option value="Transport maritime">Transport maritime</option>

                                    <option value="Transport terrestre">Transport terrestre</option>

                                    <option value="Tunisiens à l'Etranger">Tunisiens à l'Etranger</option>
                                </Input>
                                {AddForm.errors.domain && AddForm.touched.domain ?
                                <p className="mt-3 mb-0 text-muted text-sm"><span className="text-danger mr-2">
                                    <i className="ni ni-fat-remove" /> {AddForm.errors.domain}
                                </span></p> : null}
                            </FormGroup>:
                             <FormGroup>
                             <Label for="domain">
                                 Organization Domain
                             </Label>
                             <Input type="text" name="domain" id="domain"
                             {...AddForm.getFieldProps('domain')}/>
                                {AddForm.errors.domain && AddForm.touched.domain ?
                                <p className="mt-3 mb-0 text-muted text-sm"><span className="text-danger mr-2">
                                    <i className="ni ni-fat-remove" /> {AddForm.errors.domain}
                                </span></p> : null}
                            </FormGroup>
                            }

                            <FormGroup>
                                <Label for="exampleSelect">
                                    Governorate
                                </Label>
                                <Input type="select" name="governorate" id="governorate"
                                {...AddForm.getFieldProps('governorate')}>
                                    <option hidden>Select ...</option>

                                    <option value="Ariana">Ariana</option>

                                    <option value="Beja">Beja</option>

                                    <option value="Ben Arous">Ben Arous</option>

                                    <option value="Bizerte">Bizerte</option>

                                    <option value="Gabès">Gabès</option>

                                    <option value="Gafsa">Gafsa</option>

                                    <option value="Jendouba">Jendouba</option>

                                    <option value="Kairouan">Kairouan</option>

                                    <option value="Kasserine">Kasserine</option>

                                    <option value="Kebili">Kebili</option>

                                    <option value="Le Kef">Le Kef</option>

                                    <option value="Mahdia">Mahdia</option>

                                    <option value="Manouba">Manouba</option>

                                    <option value="Medenine">Medenine</option>

                                    <option value="Monastir">Monastir</option>

                                    <option value="Nabeul">Nabeul</option>

                                    <option value="Sfax">Sfax</option>

                                    <option value="Sidi Bouzid">Sidi Bouzid</option>

                                    <option value="Siliana">Siliana</option>

                                    <option value="Sousse">Sousse</option>

                                    <option value="Tataouine">Tataouine</option>

                                    <option value="Tozeur">Tozeur</option>

                                    <option value="Tunis">Tunis</option>

                                    <option value="Zaghouan">Zaghouan</option>
                                </Input>
                                {AddForm.errors.governorate && AddForm.touched.governorate ?
                                <p className="mt-3 mb-0 text-muted text-sm"><span className="text-danger mr-2">
                                    <i className="ni ni-fat-remove" /> {AddForm.errors.governorate}
                                </span></p> : null}
                            </FormGroup>

                            <FormGroup>
                                <Label for="description">
                                    Description
                                </Label>
                                <Input placeholder="Description" type="textarea"
                                 name="description" id="description"
                                 {...AddForm.getFieldProps('description')}
                                />
                                {AddForm.errors.description && AddForm.touched.description ?
                                <p className="mt-3 mb-0 text-muted text-sm"><span className="text-danger mr-2">
                                    <i className="ni ni-fat-remove" /> {AddForm.errors.description}
                                </span></p> : null}
                            </FormGroup>


                            <FormGroup>
                                <Label for="location">
                                    Location
                                </Label>
                                <Input id="location" name="location" placeholder="12 Street 1110" type="location"
                                 {...AddForm.getFieldProps('location')}/>
                                 {AddForm.errors.location && AddForm.touched.location ?
                                <p className="mt-3 mb-0 text-muted text-sm"><span className="text-danger mr-2">
                                    <i className="ni ni-fat-remove" /> {AddForm.errors.location}
                                </span></p> : null}
                            </FormGroup>

                            <FormGroup>
                                <Label for="phone">
                                    Phone
                                </Label>
                                <Input id="phone" name="phone" placeholder="20000000" type="text"
                                {...AddForm.getFieldProps('phone')}/>
                                {AddForm.errors.phone && AddForm.touched.phone ?
                                <p className="mt-3 mb-0 text-muted text-sm"><span className="text-danger mr-2">
                                    <i className="ni ni-fat-remove" /> {AddForm.errors.phone}
                                </span></p> : null}
                            </FormGroup>

                            <FormGroup>
                                <Label for="url">
                                    Website
                                </Label>
                                <Input id="url" name="url" placeholder="www.website.com" type="url"
                                {...AddForm.getFieldProps('url')}/>
                                {AddForm.errors.url && AddForm.touched.url ?
                                <p className="mt-3 mb-0 text-muted text-sm"><span className="text-danger mr-2">
                                    <i className="ni ni-fat-remove" /> {AddForm.errors.url}
                                </span></p> : null}
                            </FormGroup>


                            <FormGroup>
                                <Label for="creationDate">
                                    Creation Date
                                </Label>
                                <Input id="creationDate" name="creationDate" placeholder="date placeholder" type="date"
                                {...AddForm.getFieldProps('creationDate')}/>
                                {AddForm.errors.creationDate && AddForm.touched.creationDate ?
                                <p className="mt-3 mb-0 text-muted text-sm"><span className="text-danger mr-2">
                                    <i className="ni ni-fat-remove" /> {AddForm.errors.creationDate}
                                </span></p> : null}
                            </FormGroup>

                            <FormGroup>
                                <Label for="exampleDate">
                                    Logo
                                </Label>
                                <CustomInput className="form-control-alternative" 
                                label={logoName || "Upload logo"} type="file" name="image" id="image"
                                onChange={(e) => handleImage(e)}/>
                                {FileError != null?
                                    <p className="mt-3 mb-0 text-muted text-sm"><span className="text-danger mr-2">
                                    <i className="ni ni-fat-remove" /> {FileError}
                                </span></p> : null}
                                
                            </FormGroup>

                            <FormGroup>
                                <Label for="exampleDate">
                                    Proof Document
                                </Label>
                                <CustomInput className="form-control-alternative"
                                label={docName || "Upload Proof Document"} type="file" name="doc" id="doc"
                                onChange={(e) => handleInputDocChange(e)}/>
                                {PdfError != null ?
                                    <p className="mt-3 mb-0 text-muted text-sm"><span className="text-danger mr-2">
                                    <i className="ni ni-fat-remove" /> {PdfError}
                                </span></p> : null}
                                
                            </FormGroup>
                            <div className="text-center">
                                { PdfError !== null  || FileError !== null?
                                <Button className="mt-4" type="submit"
                                   style={{ background: "#d7363c", color: "white" }}
                                   disabled
                                >
                                    Send request
                                </Button> : 
                                <Button className="mt-4" type="submit"
                                 style={{ background: "#d7363c", color: "white" }}
                                >
                                  Send request
                                </Button>
                                }
                            </div>
                        </Form>
                    </CardBody>
                </Card>
            </Col>
        </>
    );
};

export default Register;
