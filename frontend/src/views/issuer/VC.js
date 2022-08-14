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
import VCService from 'services/VCService';
import jwt from 'jwt-decode'
import Form from "@rjsf/bootstrap-4";
import VcSchemaService from 'services/VcSchemaService';
import DidService from 'services/DidService';
import swal from 'sweetalert';
import ReactReadMoreReadLess from "react-read-more-read-less";  
function VC() {

    const [status, setStatus] = useState(0);
    const [vcModal, setVcModal] = useState(false)
    const [schema, setSchema] = useState({});
    const [formData, setFormData] = useState(null)
    const [vcRequestsList, setvcRequestsList] = useState([]);
    const [item, setitem] = useState({})
    const [holder, setholder] = useState({})
    const [holderModal, setholderModal] = useState(false)

    const openHolderModal = async (did) => {
        let ddo = await DidService.holderDetails(did)
        setholder(ddo)
        setholderModal(true)
    }

    const closeHolderModal = () => {
        setholder({})
        setholderModal(false)
    }

    const retrieveVcRequestsList = async () => {

        let didIssuer = (jwt(sessionStorage.getItem("token"))).res[0].did
        let data = await VCService.getVCRequestList(didIssuer);
        setvcRequestsList([...data])
    }

    useEffect(() => {
        retrieveVcRequestsList();
    }, [])

    const openVcModal = async (item) => {
        setitem(item)
        let data = await VcSchemaService.resolveSchema(item.vc_name)
        data.properties.credentialSubject.properties.id.default = item.did_holder
        setSchema(data.properties.credentialSubject)
        setVcModal(true)
    }

    const ClosevcModal = () => {
        setVcModal(false)
    }

    const handleVC = async ({formData}) => {
        try {
            let ddo = await DidService.resolve(formData.id)
            //let holder_pubKey = ddo.publicKey
            let privateKey = sessionStorage.getItem("privateKey")
            console.log(formData);
            let done = await VCService.issueVC({
                formData
            }, item, privateKey, ddo);
            console.log("done", done);
            if (done) {
                ClosevcModal(false)
                swal("A new verifiable credential is issued!", "An email will be sent to the holder!", "success");
            } else {
                swal("Something went wrong!", "try again!", "error");
            }
        } catch (err) {
            console.log(err)
            swal("Something went wrong!", "try again!", "error");
        }
        await retrieveVcRequestsList();
    }

    const declineRequest = async(item) => {
        try {
            let ddo = await DidService.resolve(item.did_holder)
            let done = await VCService.createVCFailed(item.id,ddo.email)
            if (done) {
                swal("Credential request declined!", "An email will be sent to the holder!", "success");
            } else {
                swal("Something went wrong!", "try again!", "error");
            }
        } catch (error) {
            console.log(error)
            swal("Something went wrong!", "try again!", "error");
        }
        await retrieveVcRequestsList();
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
                                        <h3 className="mb-0">Verifiable Credentials Request</h3>
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
                                        <th scope="col">#
                                        </th>
                                        <th scope="col">DID Holder</th>
                                        <th scope="col">Credential Type
                                        </th>
                                        <th scope="col">Date
                                        </th>
                                        <th scope="col">State
                                        </th>
                                        <th scope="col">Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>{
                                    vcRequestsList.map((item, index) => {
                                        return item.state === parseInt(status) ? <tr key={index}>
                                            <td>{
                                                index + 1
                                            }</td>
                                            <td>
                                                <ReactReadMoreReadLess
                                                    charLimit={5}
                                                    readMoreText={"Read more ▼"}
                                                    readLessText={"Read less ▲"}
                                                    readMoreStyle={{color: "#d7363c", cursor: "pointer"}}
                                                    readLessStyle={{color: "#d7363c", cursor: "pointer"}}
                                                >
                                                    {item.did_holder}
                                                </ReactReadMoreReadLess> 
                                            </td>
                                            <td>{
                                                item.vc_name
                                            }</td>
                                            <td>{
                                                item.request_date
                                            }</td>
                                            <td>{
                                                item.state === 0 ? <Badge color="warning">Pending</Badge> : item.state === 1 ? <Badge color="success">Issued</Badge> : <Badge color="danger">Declined</Badge>
                                            }</td>
                                            <td>
                                                <Button className='btn-sm' style={
                                                        {
                                                            background: "#d7363c",
                                                            color: "white"
                                                        }
                                                    }

                                                    onClick={
                                                        () => openHolderModal(item.did_holder)
                                                    }

                                                    disabled={
                                                        item.state !== 0 ? true : false
                                                }>Holder details</Button>
                                                <Button className='btn-sm' color="success"
                                                    disabled={
                                                        item.state !== 0 ? true : false
                                                    }
                                                    onClick={
                                                        () => openVcModal(item)
                                                }>Create VC</Button>
                                                <Button className='btn-sm' color="secondary" onClick={()=>declineRequest(item)}
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
                    <Modal className="modal-dialog-centered" size='lg'
                        isOpen={vcModal}
                        toggle={ClosevcModal}>
                        <div className="modal-header">
                            <h4 className="modal-title" id="modal-title-default">
                                Fill in the VC informations
                            </h4>
                            <button aria-label="Close" className="close" data-dismiss="modal" type="button"
                                onClick={ClosevcModal}>
                                <span aria-hidden={true}>×</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <Form schema={schema}
                                onSubmit={handleVC}
                                formData={formData}
                                onChange={
                                    e => setFormData(e.formData)
                                }/>
                        </div>
                    </Modal>
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



export default VC
