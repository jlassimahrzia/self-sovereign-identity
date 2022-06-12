import {useHistory} from 'react-router-dom';
import {React, useState} from 'react'
import AuthService from "../../services/AuthService";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    FormGroup,
    Form,
    Input,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Col,
    Modal,
    Label
} from "reactstrap";
import {useFormik} from 'formik'
import * as Yup from 'yup'
import swal from 'sweetalert';

const Login = () => {

    const history = useHistory();
    const [pkModal, setpkModal] = useState(false)
    const [pkVerifierModal, setpkVerifierModal] = useState(false)
    const [privateKey, setPrivateKey] = useState("")
    const [did, setdid] = useState("")
    const [subProps, setsubProps] = useState(null)

    const ClosepkModal = () => {
        subProps.resetForm()
        sessionStorage.removeItem("token")
        setpkModal(false)
    }

    const OpenpkModal = (submitProps, did) => {
        setdid(did)
        setsubProps(submitProps)
        setpkModal(true)
    }

    const ClosepkVerifierModal = () => {
        subProps.resetForm()
        sessionStorage.removeItem("token")
        setpkVerifierModal(false)
    }

    const OpenpkVerifierModal = (submitProps, did) => {
        setdid(did)
        setsubProps(submitProps)
        setpkVerifierModal(true)
    }


    const [tabs, settabs] = useState(2)
    const validationSchema0 = Yup.object({password: Yup.string().required(), email: Yup.string().email().required()})

    const [validationSchema, setvalidationSchema] = useState(validationSchema0)

    const logIssuer = () => {
        settabs(1)
        const validationSchema1 = Yup.object({password: Yup.string().required(), did: Yup.string().required()})
        setvalidationSchema(validationSchema1)
    }
    const logAdmin = () => {
        console.log("click");
        settabs(2)
        const validationSchema2 = Yup.object({password: Yup.string().required(), email: Yup.string().email().required()})
        setvalidationSchema(validationSchema2)
    }

    const logVerifier = () => {
        settabs(3)
        const validationSchema1 = Yup.object({password: Yup.string().required(), did: Yup.string().required()})
        setvalidationSchema(validationSchema1)
    }

    const LoginForm = useFormik({
        initialValues: {
                password: '',
                did: ''
            },
        onSubmit: async (values, submitProps) => {
                try {
                    const data = await AuthService.login(values.did, values.password)
                    console.log(data)
                    if (data.done === true) {
                        console.log(data.done)
                        console.log(data)
                        sessionStorage.setItem("token", data.x)
                        OpenpkModal(submitProps, values.did)
                    } else {
                        swal("Your did or password is incorrrect!", "Try Again!", "error");
                        submitProps.resetForm()
                    }
                } catch {console.log("error")}},
            validationSchema
        }
    )

    const storePk = async () => {
        if (privateKey !== "") {
            const done = await AuthService.checkPrivatekey(did, privateKey)
            console.log("done", done);
            if (done) {
                sessionStorage.setItem("privateKey", privateKey)
                history.push('/organization');
            } else {
                swal("Private key not valid !", "Try Again please!", "error");
            }
        } else {
            swal("You should enter your private key!", "Try Again please!", "error");
        }
    }

    const storePkVerifier = async () => {
        if (privateKey !== "") {
            const done = await AuthService.checkPrivatekeyVerifier(did, privateKey)
            console.log("done", done);
            if (done) {
                sessionStorage.setItem("privateKey", privateKey)
                history.push('/verifier');
            } else {
                swal("Private key not valid !", "Try Again please!", "error");
            }
        } else {
            swal("You should enter your private key!", "Try Again please!", "error");
        }
    }

    const LoginVerifierForm = useFormik({
        initialValues: {
            password: '',
            did: ''
        },
        onSubmit:  async (values, submitProps) => {
            try {
                const data = await AuthService.loginVerifier(values.did, values.password)
                console.log(data)
                if (data.done === true) {
                    console.log(data.done)
                    console.log(data)
                    sessionStorage.setItem("token", data.x)
                    OpenpkVerifierModal(submitProps, values.did)
                } else {
                    swal("Your did or password is incorrrect!", "Try Again!", "error");
                    submitProps.resetForm()
                }
            } catch {console.log("error")}
        },
        validationSchema
    })

    const LoginAdminForm = useFormik({
        initialValues: {
                password: '',
                email: ''
            },
        onSubmit: async (values, submitProps) => {
            console.log("Admin");
                try {
                    const data = await AuthService.loginAdmin(values.email, values.password)
                    console.log(data)
                    if (data.done === true) {
                        console.log(data.done)
                        console.log(data)
                        sessionStorage.setItem("token", data.x)
                        history.push('/issuer/index');
                    } else {
                        swal("Your account or password is incorrrect!", "Try Again!", "error");
                        submitProps.resetForm()
                    }
                } catch {console.log("error")}},
            validationSchema
        }
    )
    
    return (
        <>
            <Col lg="5" md="7">
                <Card className=" shadow border-0"
                    style={
                        {borderColor: "#d7363c"}
                }>
                    <CardHeader className="bg-white pb-5">
                        {
                        tabs === 1 ? <div className="text-center text-muted mb-4">
                            <h3>Login As Issuer</h3>
                            <p>Sign in with your Decentralized Identifier</p>
                        </div> : null
                    }
                        {
                        tabs === 2 ? <div className="text-center text-muted mb-4">
                            <h3>Login As Admin</h3>
                            <p>Sign in with your Credentials</p>
                        </div> : null
                    }
                        {
                        tabs === 3 ? <div className="text-center text-muted mb-4">
                            <h3>Login As Verifier</h3>
                            <p>Sign in with your Decentralized Identifier</p>
                        </div> : null
                    }
                        <div className="btn-wrapper text-center">
                            <Button color={
                                    tabs === 2 ? "danger" : "secondary"
                                }
                                type="button"
                                onClick={logAdmin}>
                                Admin
                            </Button>
                            <Button color={
                                    tabs === 1 ? "danger" : "secondary"
                                }
                                type="button"
                                onClick={logIssuer}>
                                Issuer
                            </Button>

                            <Button color={
                                    tabs === 3 ? "danger" : "secondary"
                                }
                                type="button"
                                onClick={logVerifier}>
                                Verifier
                            </Button>
                        </div>
                    </CardHeader>
                    <CardBody className="px-lg-5 py-lg-5">
                        {
                        tabs === 1 ? <Form onSubmit={
                            LoginForm.handleSubmit
                        }>
                            <FormGroup className="mb-3">
                                <InputGroup className="input-group-alternative">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-email-83"/>
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input placeholder="Did" type="did" name="did" id="did" {...LoginForm.getFieldProps('did')}/>
                                </InputGroup>
                                {
                                LoginForm.errors.did && LoginForm.touched.did ? <p className="mt-3 mb-0 text-muted text-sm">
                                    <span className="text-danger mr-2">
                                        <i className="ni ni-fat-remove"/> {
                                        LoginForm.errors.did
                                    } </span>
                                </p> : null
                            } </FormGroup>
                            <FormGroup>
                                <InputGroup className="input-group-alternative">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-lock-circle-open"/>
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input placeholder="Password" type="password" name="password" id="password" {...LoginForm.getFieldProps('password')}/>
                                </InputGroup>
                                {
                                LoginForm.errors.password && LoginForm.touched.password ? <p className="mt-3 mb-0 text-muted text-sm">
                                    <span className="text-danger mr-2">
                                        <i className="ni ni-fat-remove"/> {
                                        LoginForm.errors.password
                                    } </span>
                                </p> : null
                            } </FormGroup>

                            <div className="text-center">
                                <Button className="my-4"
                                    style={
                                        {
                                            background: "#d7363c",
                                            color: "white"
                                        }
                                    }
                                    type="submit">
                                    Sign in
                                </Button>
                            </div>
                        </Form> : null
                    }
                        {
                        tabs === 2 ? <Form onSubmit={
                            LoginAdminForm.handleSubmit
                        }>
                            <FormGroup className="mb-3">
                                <InputGroup className="input-group-alternative">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-email-83"/>
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input placeholder="Email" type="email" name="email" id="email" {...LoginAdminForm.getFieldProps('email')}/>
                                </InputGroup>
                                {
                                LoginAdminForm.errors.email && LoginAdminForm.touched.email ? <p className="mt-3 mb-0 text-muted text-sm">
                                    <span className="text-danger mr-2">
                                        <i className="ni ni-fat-remove"/> {
                                        LoginAdminForm.errors.email
                                    } </span>
                                </p> : null
                            } </FormGroup>
                            <FormGroup>
                                <InputGroup className="input-group-alternative">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-lock-circle-open"/>
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input placeholder="Password" type="password" name="password" id="password" {...LoginAdminForm.getFieldProps('password')}/>
                                </InputGroup>
                                {
                                LoginAdminForm.errors.password && LoginAdminForm.touched.password ? <p className="mt-3 mb-0 text-muted text-sm">
                                    <span className="text-danger mr-2">
                                        <i className="ni ni-fat-remove"/> {
                                        LoginAdminForm.errors.password
                                    } </span>
                                </p> : null
                            } </FormGroup>

                            <div className="text-center">
                                <Button className="my-4"
                                    style={
                                        {
                                            background: "#d7363c",
                                            color: "white"
                                        }
                                    }
                                    type="submit">
                                    Sign in
                                </Button>
                            </div>
                        </Form> : null
                    }
                        {
                        tabs === 3 ? <Form onSubmit={
                            LoginVerifierForm.handleSubmit
                        }>
                            <FormGroup className="mb-3">
                                <InputGroup className="input-group-alternative">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-email-83"/>
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input placeholder="Did" type="did" name="did" id="did" {...LoginVerifierForm.getFieldProps('did')}/>
                                </InputGroup>
                                {
                                LoginVerifierForm.errors.did && LoginVerifierForm.touched.did ? <p className="mt-3 mb-0 text-muted text-sm">
                                    <span className="text-danger mr-2">
                                        <i className="ni ni-fat-remove"/> {
                                        LoginVerifierForm.errors.did
                                    } </span>
                                </p> : null
                            } </FormGroup>
                            <FormGroup>
                                <InputGroup className="input-group-alternative">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-lock-circle-open"/>
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input placeholder="Password" type="password" name="password" id="password" {...LoginVerifierForm.getFieldProps('password')}/>
                                </InputGroup>
                                {
                                LoginVerifierForm.errors.password && LoginVerifierForm.touched.password ? <p className="mt-3 mb-0 text-muted text-sm">
                                    <span className="text-danger mr-2">
                                        <i className="ni ni-fat-remove"/> {
                                        LoginVerifierForm.errors.password
                                    } </span>
                                </p> : null
                            } </FormGroup>

                            <div className="text-center">
                                <Button className="my-4"
                                    style={
                                        {
                                            background: "#d7363c",
                                            color: "white"
                                        }
                                    }
                                    type="submit">
                                    Sign in
                                </Button>
                            </div>
                        </Form> : null
                    } </CardBody>
                </Card>
                <Modal className="modal-dialog-centered" size='xs'
                    isOpen={pkModal}
                    toggle={ClosepkModal}>
                    <div className="modal-header">
                        <h4 className="modal-title" id="modal-title-default">
                            Fill in your private Key
                        </h4>
                        <button aria-label="Close" className="close" data-dismiss="modal" type="button"
                            onClick={ClosepkModal}>
                            <span aria-hidden={true}>×</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div>
                            <FormGroup>
                                <Label>
                                    Private Key
                                </Label>
                                <Input onChange={
                                    (e) => setPrivateKey(e.target.value)
                                }/>
                            </FormGroup>
                            <Button className="my-4" color="primary" type="button"
                                onClick={storePk}>
                                Confirm
                            </Button>
                            <Button className="my-4" type="button"
                                onClick={ClosepkModal}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Modal>
                <Modal className="modal-dialog-centered" size='xs'
                    isOpen={pkVerifierModal}
                    toggle={ClosepkVerifierModal}>
                    <div className="modal-header">
                        <h4 className="modal-title" id="modal-title-default">
                            Fill in your private Key
                        </h4>
                        <button aria-label="Close" className="close" data-dismiss="modal" type="button"
                            onClick={ClosepkVerifierModal}>
                            <span aria-hidden={true}>×</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div>
                            <FormGroup>
                                <Label>
                                    Private Key
                                </Label>
                                <Input onChange={
                                    (e) => setPrivateKey(e.target.value)
                                }/>
                            </FormGroup>
                            <Button className="my-4" color="primary" type="button"
                                onClick={storePkVerifier}>
                                Confirm
                            </Button>
                            <Button className="my-4" type="button"
                                onClick={ClosepkVerifierModal}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Modal>
            </Col>
        </>
    );
};

export default Login;
