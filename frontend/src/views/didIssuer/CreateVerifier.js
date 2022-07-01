import React from 'react'
import {Fragment, useState, useEffect} from 'react'
import {
    Table,
    Container,
    Row,
    Col,
    Button,
    Card,
    CardHeader,
    Input, Badge, Modal
} from "reactstrap";
import PageHeader from "components/Headers/PageHeader.js";
import VerifierService from 'services/VerifierService';
import swal from 'sweetalert';
import ReactReadMoreReadLess from "react-read-more-read-less";  
import { environment } from 'environment/env';
import Viewer, { Worker } from '@phuocng/react-pdf-viewer';
import '@phuocng/react-pdf-viewer/cjs/react-pdf-viewer.css';

function CreateVerifier() {
    const [VerifierRequestsList, setVerifierRequestsList] = useState([]);
    const [status, setStatus] = useState(0);

    // PDF
    const [pdfModal, setPdfModal] = useState(false);
    const [pdf, setPdf] = useState("");

    const retrieveVerifierRequestsList = async () => {
        let data = await VerifierService.getVerifierList();
        setVerifierRequestsList([...data])
        console.log(data)
    }

    useEffect(() => {
        retrieveVerifierRequestsList();
    }, [])

    useEffect(() => {

    }, [VerifierRequestsList])

    const createVerifier = async (item) => {
        const data = await VerifierService.createVerifier(item.name, item.email, item.id)

        if (data) {

            let res = await VerifierService.mappingDidToHash(data.cid.path, data.identifier)

            const ddo = await VerifierService.resolve(data.identifier)
            console.log(res);
            if(ddo){
                swal("A new Verifier has been created successfully!", "", "success");
            }
            else{
                swal("Something went wrong try again!", "", "error");
            }
        }

        await retrieveVerifierRequestsList();
    }

    const createVerifierFailed = async (item) => {
        const done = await VerifierService.createVerifierFailed(item.email, item.id)
        if (done) {
            swal("Verifier request declined!", "", "warning");
        }
        else{
            swal("Something went wrong try again!", "", "error");
        }
        await retrieveVerifierRequestsList();
    }

    // PDF Modal
    const OpenPdfModal = (pdf) => {
        setPdf(pdf)
        setPdfModal(true)
    };
    const ClosePdfModal = () => {
        setPdf("")
        setPdfModal(false)
    };


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
                                        <h3 className="mb-0">Verifiers DID Request</h3>
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
                                        <th scope="col">Logo</th>
                                        <th scope="col">Organization Name</th>
                                        <th scope="col">Category</th>
                                        <th scope="col">Domain</th>
                                        <th scope="col">Governorate</th>
                                        <th scope="col">Location</th>
                                        <th scope="col">Email</th>
                                        <th scope="col">Phone</th>
                                        <th scope="col">Website</th>
                                        <th scope="col">Description</th>
                                        <th scope="col">Creation Date</th>
                                        <th scope="col">Address</th>
                                        <th scope="col">Public Key</th>
                                        <th scope="col">DID</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Proof Document</th>
                                        <th scope="col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>{
                                    VerifierRequestsList.map((item, index) => {
                                        return item.state === parseInt(status) ? <tr key={index}>
                                            <td>{
                                                index + 1
                                            }</td>
                                            <td>
                                                <img style={{ width: "100%" }} alt="..."
                                                    src={`${environment.SERVER_API_URL}/image/` + item.logo} />
                                            </td>
                                            <td>{
                                                item.name
                                            }</td>
                                            <td>{
                                                item.category
                                            }</td>
                                            <td>{
                                                item.domain
                                            }</td>
                                            <td>{
                                                item.governorate
                                            }</td>
                                            <td>{
                                                item.location
                                            }</td>
                                            <td>{
                                                item.email
                                            }</td>
                                            <td>{
                                                item.phone
                                            }</td>
                                            <td>{
                                                <a href={item.website} style={{color: "#5e72e4"}} target="_blank" rel="noreferrer"> {item.website}</a>
                                            }</td>
                                            <td style={{width : "200px", owhiteSpace : "normal"}}>
                                                <ReactReadMoreReadLess
                                                    charLimit={80}
                                                    readMoreText={"Read more ▼"}
                                                    readLessText={"Read less ▲"}
                                                    readMoreStyle={{color: "#d7363c", cursor: "pointer"}}
                                                    readLessStyle={{color: "#d7363c", cursor: "pointer"}}
                                                >
                                                    {item.description}
                                                </ReactReadMoreReadLess>
                                            </td>
                                            <td>{
                                                item.dateCreation
                                            }</td>
                                            <td>{
                                                item.address === null ? "Not defined" : item.address
                                            }</td>
                                            <td>{
                                                item.publicKey === null ? "Not defined" : item.publicKey
                                            }</td>
                                             <td>{
                                                item.did === '' ? "Not defined" : item.did
                                            }</td>                    
                                            <td>{
                                                item.state === 0 ? <Badge color="warning">Pending</Badge> : item.state === 1 ? <Badge color="success">Issued</Badge> : <Badge color="danger">Declined</Badge>
                                            }</td>
                                            <td>
                                                <Button color="primary" size="sm" type="button" 
                                                onClick={() => OpenPdfModal(item.file)}>See proof doc</Button>
                                            </td>
                                            <td>
                                                <Button style={
                                                        {
                                                            background: "#d7363c",
                                                            color: "white"
                                                        }
                                                    }
                                                    disabled={
                                                        item.state !== 0 ? true : false
                                                    }
                                                    onClick={
                                                        () => {
                                                            createVerifier(item)
                                                        }
                                                    }
                                                >Create Identity</Button>
                                                <Button 
                                                    onClick={
                                                        () => createVerifierFailed(item)
                                                    }
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
                 {/* Pdf Modal */}
                 <Modal
                        className="modal-dialog-centered"
                        size="lg"
                        style={{ maxWidth: '1600px', width: '80%' }}
                        isOpen={pdfModal}
                        toggle={ClosePdfModal}
                    >

                        <div className="modal-body" style={{ padding: '0px' }}>
                            <Worker workerUrl="https://cdn.jsdelivr.net/npm/pdfjs-dist@2.4.456/build/pdf.worker.js">
                                <div style={{ height: '85vh' }}>
                                    <Viewer fileUrl={`${environment.SERVER_API_URL}/pdf/${pdf}`} />
                                </div>
                            </Worker>
                        </div>

                    </Modal>
            </Container>
        </>
    )
}

export default CreateVerifier
