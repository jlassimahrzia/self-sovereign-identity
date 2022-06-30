import PageHeader from "components/Headers/PageHeader";
import {useState, useEffect} from "react";
import {
    Table,
    Container,
    Row,
    Col,
    Card,
    CardHeader,
    Modal,
    ListGroup,
    ListGroupItem,
    ListGroupItemHeading,
    ListGroupItemText
} from "reactstrap";
import {
    Button,
    Input,
    Badge,
    DropdownMenu,
    DropdownItem,
    DropdownToggle,
    UncontrolledDropdown,
    Media
} from "reactstrap";
import swal from 'sweetalert';
import VerifierService from "services/VerifierService";
import IssuerService from "services/IssuerService";
import jwt from 'jwt-decode'
import DidService from "services/DidService";

const VerificationResponse = () => {

    const [status, setStatus] = useState(0);
    const [verificationResponseList, setVerificationResponseList] = useState([]);
    const [servicesRequestsList, setServicesRequestsList] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [issuers, setIssuers] = useState([])
    const [result, setResult] = useState({})
    const [item, setitem] = useState({})
    const [holder, setholder] = useState({})
    const [holderModal, setholderModal] = useState(false)

    const retrieveIssuersList = async () => {
        let data = await IssuerService.getIssuers()
        let issuerList = []
        data.forEach(element => {
            issuerList.push({value: element.did, label: element.name})
        });
        setIssuers(issuerList)
    }


    const openModal = async (item) => {
        setitem(item)
        let res = await VerifierService.verifyResponse(item);
        setResult(res)
        setModalVisible(true)
    };

    const closeModal = () => {
        setModalVisible(false)
    };

    const retrieveServicesRequestsList = async () => {
        let didVerifier = (jwt(sessionStorage.getItem("token"))).res[0].did
        let data = await VerifierService.getServicesRequestList(didVerifier);
        setServicesRequestsList([... data])
    }

    const retrieveVerificationResponseList = async () => {
        let data = await VerifierService.getVerificationResponseList();
        setVerificationResponseList([... data])
    }

    const verifyResponse = async (item) => {
        let res = await VerifierService.verifyResponse(item);
        if (res.test) {
            swal(res.msg, "we have verified data structure and signatures", "success");
        } else {
            swal("Documents Sended are not valid", res.msg, "error");
        }
    }

    function getService(id) {
        let data = servicesRequestsList.filter(request => request.id === id)
        return data[0] ?. verification_request_name
    }

    useEffect(() => {
        retrieveVerificationResponseList()
        retrieveServicesRequestsList()
        retrieveIssuersList();
    }, [])

    const getIssuer = (did) => {
        let data = issuers.filter(issuer => issuer.value === did)
        return data[0].label
    }

    useEffect(() => {}, [verificationResponseList, servicesRequestsList])


    const acceptRequest = async (id) => {
        let done = await VerifierService.acceptRequest(id)
        if (done) {
            swal("Service request accepted", "", "success");
        } else {
            swal("Something went wrong", "Try again", "error");
        }
        setModalVisible(false)
    }

    const declineRequest = async (id) => {
        let done = await VerifierService.declineRequest(id)
        if (done) {
            swal("Service request declined", "", "warning");
        } else {
            swal("Something went wrong", "Try again", "error");
        }
        setModalVisible(false)
    }

    const openHolderModal = async (did) => {
        let ddo = await DidService.holderDetails(did)
        setholder(ddo)
        setholderModal(true)
    }

    const closeHolderModal = () => {
        setholder({})
        setholderModal(false)
    }

    return (
        <div>
            <PageHeader/>
            <Container className="mt--7" fluid>
                <Row>
                    <div className="col">
                        <Card className="shadow">
                            {/* Header */}
                            <CardHeader className="border-0">
                                <Row className="align-items-center">
                                    <Col xs="8">
                                        <h3 className="mb-0">Verification Response</h3>
                                    </Col>
                                    <Col xs="4">
                                        <Input type="select" id="exampleSelect" name="select"
                                            onChange={
                                                (e) => setStatus(e.target.value)
                                        }>
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
                                        <th scope="col">DID Holder</th>
                                        <th scope="col">Service Type</th>
                                        <th scope="col">Date</th>
                                        <th scope="col">State</th>
                                        <th scope="col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>{
                                    verificationResponseList.map((item, index) => {
                                        return item.state === parseInt(status) ? <tr key={index}>
                                            <td>{
                                                index + 1
                                            }</td>
                                            <td>{
                                                item.did_holder
                                            }</td>
                                            <td>{
                                                getService(item.idRequest)
                                            }</td>
                                            <td>{
                                                item.date
                                            }</td>
                                            <td>{
                                                item.state === 0 ? <Badge color="warning">Pending</Badge> : item.state === 1 ? <Badge color="success">Issued</Badge> : <Badge color="danger">Declined</Badge>
                                            }</td>
                                            <td>
                                                <UncontrolledDropdown>
                                                    <DropdownToggle className="btn btn-danger">
                                                        <i className="ni ni-bold-up text-white"></i>
                                                        <span className="mb-0 text-sm font-weight-bold">
                                                            Actions
                                                        </span>
                                                    </DropdownToggle>
                                                    <DropdownMenu className="dropdown-menu-arrow" right>
                                                        <DropdownItem onClick={
                                                                () => verifyResponse(item)
                                                            }
                                                            disabled={
                                                                parseInt(status) !== 0
                                                        }>
                                                            <span>Verify Docs</span>
                                                        </DropdownItem>
                                                        <DropdownItem onClick={
                                                                () => openModal(item)
                                                            }
                                                            disabled={
                                                                parseInt(status) !== 0
                                                        }>
                                                            <span>See Docs</span>
                                                        </DropdownItem>
                                                        <DropdownItem onClick={
                                                            () => openHolderModal(item.did_holder)
                                                        }>
                                                            <span>Holder Details</span>
                                                        </DropdownItem>
                                                    </DropdownMenu>
                                                </UncontrolledDropdown>
                                            </td>
                                        </tr> : ""
                                    })
                                }</tbody>
                            </Table>
                        </Card>
                    </div>
                </Row>
                {
                result.decrypted && <Modal className="modal-dialog-centered" size='lg'
                    isOpen={modalVisible}
                    toggle={closeModal}>
                    <div className="modal-header">

                        <h4 className="modal-title" id="modal-title-default"
                            style={
                                {textTransform: "uppercase"}
                        }>
                            Verification Response : {
                            result.decrypted.title
                        } </h4>
                        <button aria-label="Close" className="close" data-dismiss="modal" type="button"
                            onClick={closeModal}>
                            <span aria-hidden={true}>×</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div> {
                            result.test ? <div class="alert alert-success" role="alert">
                                <b>Verification Process Success !
                                </b>
                                we have verified data structure and signatures.
                            </div> : <div class="alert alert-danger" role="alert">
                                <b>Documents sended are not valid !
                                </b>
                                {
                                result.msg
                            } </div>
                        } </div>
                        <div>
                            <h3>
                                Title : {
                                result.decrypted.title
                            } </h3>
                            <p>
                                <b>Description : {
                                    result.decrypted.description
                                } </b>
                            </p>
                        </div>
                        <ListGroup> {
                            result.decrypted.verifiableCredential ? (result.decrypted.verifiableCredential.map((item, index) => {
                                return (
                                    <ListGroupItem key={index}>
                                        <ListGroupItemHeading>
                                            Credential {
                                            index + 1
                                        }
                                            : {
                                            item.credentialSchema.id
                                        }
                                            <br/>
                                            Issuer : {
                                            getIssuer(item.issuer)
                                        } </ListGroupItemHeading>
                                        <ListGroupItemText>
                                            <div style={
                                                {
                                                    margin: "20px",
                                                    marginTop: "0px"
                                                }
                                            }>
                                                {
                                                item.credentialSubject ? (Object.entries(item.credentialSubject).map((element, index) => {
                                                    return (
                                                        <Row>
                                                            <div>
                                                                <span className='headingProp'>
                                                                    {
                                                                    element[0]
                                                                } </span>
                                                                <span className='descriptionProp'>
                                                                    {
                                                                    element[1]
                                                                } </span>
                                                            </div>
                                                        </Row>
                                                    );
                                                })) : null
                                            } </div>
                                        </ListGroupItemText>
                                    </ListGroupItem>
                                );
                            })) : null
                        } </ListGroup>
                        <div></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary"
                            onClick={
                                () => acceptRequest(item.id)
                        }>Accept</button>
                        <button type="button" class="btn btn-danger"
                            onClick={
                                () => declineRequest(item.id)
                            }
                            disabled={
                                !result.test
                        }>Decline</button>
                    </div>
                </Modal>
            }
                <Modal className="modal-dialog-centered"
                    isOpen={holderModal}
                    toggle={closeHolderModal}>
                    <div className="modal-header">

                        <h4 className="modal-title" id="modal-title-default"
                            style={
                                {textTransform: "uppercase"}
                        }>
                            Holder Details
                        </h4>
                        <button aria-label="Close" className="close" data-dismiss="modal" type="button"
                            onClick={closeHolderModal}>
                            <span aria-hidden={true}>×</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div>
                            <span className='headingProp'>
                               Firstname
                            </span>
                            <span className='descriptionProp'>
                                {
                                holder.firstname
                            } </span>
                        </div>
                        <div>
                            <span className='headingProp'>
                               Lastname
                            </span>
                            <span className='descriptionProp'>
                                {
                                holder.lastname
                            } </span>
                        </div>
                        <div>
                            <span className='headingProp'>
                               Email
                            </span>
                            <span className='descriptionProp'>
                                {
                                holder.email
                            } </span>
                        </div>
                        <div>
                            <span className='headingProp'>
                               public key
                            </span>
                            <span className='descriptionProp'>
                                {
                                holder.publicKey
                            } </span>
                        </div>
                    </div>
                </Modal>
            </Container>
        </div>
    )

}

export default VerificationResponse;
