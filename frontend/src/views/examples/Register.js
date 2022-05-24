import {
    Button,
    Card,
    CardBody,
    FormGroup,
    Form,
    Input,
    Label,
    Col
} from "reactstrap";
import React from 'react'
import {useState, useEffect} from 'react'
import swal from 'sweetalert';
import RegisterService from '../../services/RegisterService';

const Register = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [description, setDescription] = useState("")
    const [location, setLocation] = useState("")
    const [category, setCategory] = useState("")

    const [domain, setDomain] = useState("")
    const [website, setWebsite] = useState("")
    const [dateCreation, setDateCreation] = useState("")
    const [phone, setPhone] = useState("")

    useEffect(() => {}, [])

    const sendIssuerRequest = async (e) => {
        // const file = e.target.files[0];
        // const formData = new FormData()
        // formData.append('image',file)
        const data = await RegisterService.sendIssuerRequest(category, name, email, phone, domain, website, dateCreation, description, location, "logo.png", "aa")
        console.log(data)
        swal("Your registration process is done!", "You will recieve an email if your request is accepted!", "success");
    }


    return (
        <>
            <Col lg="6" md="8">
                <Card className="bg-secondary shadow border-0">

                    <CardBody className="px-lg-5 py-lg-5">
                        <div className="text-center text-muted mb-4">
                            <small>Sign up with credentials</small>
                        </div>
                        <Form role="form">
                            <FormGroup>

                                <Label for="exampleEmail">
                                    Name
                                </Label>
                                <Input placeholder="Name" type="text"
                                    onChange={
                                        (e) => setName(e.target.value)
                                    }/>

                            </FormGroup>
                            <FormGroup>
                                <Label for="exampleEmail">
                                    Email
                                </Label>

                                <Input placeholder="email@example.com" type="email" autoComplete="new-email"
                                    onChange={
                                        (e) => setEmail(e.target.value)
                                    }/>

                            </FormGroup>


                            <FormGroup>
                                <Label for="exampleEmail">
                                    Organization Category
                                </Label>
                                <Input id="exampleSelect" name="select" type="select"
                                    onChange={
                                        (e) => setCategory(e.target.value)
                                }>
                                    <option></option>
                                    <option value="Association"
                                        onChange={
                                            (e) => setCategory(e.target.value)
                                    }>
                                        Association

                                    </option>
                                    <option value="Entreprise"
                                        onChange={
                                            (e) => setCategory(e.target.value)
                                    }>
                                        Entreprise
                                    </option>
                                    <option value="Organization"
                                        onChange={
                                            (e) => setCategory(e.target.value)
                                    }>
                                        Organization
                                    </option>

                                </Input>
                            </FormGroup>

                            <FormGroup>
                                <Label for="exampleSelect">
                                    Organization Domain
                                </Label>
                                <Input id="exampleSelect" name="select" type="select"

                                    onChange={
                                        (e) => setDomain(e.target.value)
                                }>
                                    <option></option>
                                    <option value="Studies"
                                        onChange={
                                            (e) => setDomain(e.target.value)
                                    }>
                                        Studies
                                    </option>
                                    <option value="Healthcare"
                                        onChange={
                                            (e) => setDomain(e.target.value)
                                    }>
                                        Healthcare
                                    </option>
                                    <option value="Technologies"
                                        onChange={
                                            (e) => setDomain(e.target.value)
                                    }>
                                        Technologies
                                    </option>

                                </Input>
                            </FormGroup>


                            <FormGroup>
                                <Label for="description">
                                    Description
                                </Label>
                                <Input id="description" name="description" placeholder="Description" type="text"
                                    onChange={
                                        (e) => setDescription(e.target.value)
                                    }/>
                            </FormGroup>


                            <FormGroup>
                                <Label for="location">
                                    Location
                                </Label>
                                <Input id="location" name="location" placeholder="12 Street 1110" type="location"
                                    onChange={
                                        (e) => setLocation(e.target.value)
                                    }/>
                            </FormGroup>

                            <FormGroup>
                                <Label for="phone">
                                    Phone
                                </Label>
                                <Input id="phone" name="phone" placeholder="20000000" type="text"
                                    onChange={
                                        (e) => setPhone(e.target.value)
                                    }/>
                            </FormGroup>

                            <FormGroup>
                                <Label for="exampleUrl">
                                    Website
                                </Label>
                                <Input id="exampleUrl" name="url" placeholder="www.website.com" type="url"
                                    onChange={
                                        (e) => setWebsite(e.target.value)
                                    }/>
                            </FormGroup>


                            <FormGroup>
                                <Label for="exampleDate">
                                    Creation Date
                                </Label>
                                <Input id="exampleDate" name="dateCreation" placeholder="date placeholder" type="date"
                                    onChange={
                                        (e) => setDateCreation(e.target.value)
                                    }/>
                            </FormGroup>


                            <div className="text-center">
                                <Button className="mt-4" type="button"
                                    onClick={sendIssuerRequest}
                                    style={
                                        {
                                            background: "#d7363c",
                                            color: "white"
                                        }
                                }>
                                    Send request
                                </Button>
                            </div>
                        </Form>
                    </CardBody>
                </Card>
            </Col>
        </>
    );
};

export default Register;
