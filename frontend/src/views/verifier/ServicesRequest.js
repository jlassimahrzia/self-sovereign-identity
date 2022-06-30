import React from 'react'
import {Button, Input, Badge} from "reactstrap";
import {useState, useEffect} from 'react'
import {
    Table,
    Container,
    Row,
    Col,
    Card,
    CardHeader,
    Modal
} from "reactstrap";
import PageHeader from "components/Headers/PageHeader.js";
import VerifierService from 'services/VerifierService';
import swal from 'sweetalert';
import jwt from 'jwt-decode'
import DidService from 'services/DidService';

function ServicesRequest() {

    const [status, setStatus] = useState(0);
    const [servicesRequestsList, setServicesRequestsList] = useState([]);
    const [holder, setholder] = useState({})
    const [holderModal, setholderModal] = useState(false)

    const retrieveServicesRequestsList = async () => {
        let didVerifier = (jwt(sessionStorage.getItem("token"))).res[0].did
        let data = await VerifierService.getServicesRequestList(didVerifier);
        setServicesRequestsList([...data])
    }

    useEffect(() => {
        retrieveServicesRequestsList();
    }, [])

    useEffect(() => { 

    }, [servicesRequestsList])

    const sendVerificationRequest = async (request) => {
        let done = VerifierService.sendVerificationRequest(request)
        if (done) {
            swal("Verification request sended successfully", "", "success");
        }
        else{
            swal("Something went wrong try again!", "", "error");
        }
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

    const declineService = async (id) => {
        let done = await VerifierService.declineService(id)
        if (done) {
            swal("Service request declined", "", "warning");
        }
        else{
            swal("Something went wrong try again!", "", "error");
        }
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
                                        <h3 className="mb-0">Services Request</h3>
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
                                        <th scope="col">Verification Type</th>
                                        <th scope="col">Date</th>
                                        <th scope="col">State</th>
                                        <th scope="col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>{
                                    servicesRequestsList.map((item, index) => {
                                        return item.state === parseInt(status) ? <tr key={index}>
                                            <td>{
                                                index + 1
                                            }</td>
                                            <td>{
                                                item.did_holder
                                            }</td>
                                            <td>{
                                                item.verification_request_name
                                            }</td>  
                                            <td>{
                                                item.request_date
                                            }</td>
                                            <td>{
                                                item.state === 0 ? <Badge color="warning">Pending</Badge> : item.state === 1 ? <Badge color="success">Issued</Badge> : <Badge color="danger">Declined</Badge>
                                            }</td>
                                            <td>
                                                <Button style={
                                                        {
                                                            background: "#d7363c",
                                                            color: "white"
                                                        }
                                                    }
                                                onClick={() => openHolderModal(item.did_holder)}>Holder details</Button>
                                                <Button color="success"
                                                    disabled={
                                                        item.state !== 0 ? true : false
                                                    }
                                                    onClick={
                                                        () => sendVerificationRequest(item)
                                                }>Send Verification Request</Button>
                                                <Button color="secondary" onClick={()=>declineService(item.id)}
                                                    disabled={
                                                        item.state !== 0 ? true : false
                                                }>Decline Request</Button>
                                            </td>
                                        </tr> : ""
                                    })
                                }</tbody>
                            </Table>
                        </Card>
                    </div>
                </Row>
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

export default ServicesRequest
