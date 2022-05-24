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
    Input
} from "reactstrap";
import PageHeader from "components/Headers/PageHeader.js";
import IssuerService from '../../services/IssuerService';
import swal from 'sweetalert';


function CreateIssuer() {
    const [IssuerRequestsList, setIssuerRequestsList] = useState([]);
    const [status, setStatus] = useState(0);


    const retrieveIssuerRequestsList = async () => {
        console.log("aaa")
        let data = await IssuerService.getIssuersList();
        setIssuerRequestsList([... data])
        console.log(data)
    }

    useEffect(() => {
        retrieveIssuerRequestsList();

    }, [])

    const createIssuer = async (name, category, domain, publickey, email, id, date, website, phone) => {
        const data = await IssuerService.createIssuer(name, category, domain, publickey, email, id, date, website, phone)
        console.log("data", data)
        if (data) {

            await IssuerService.mappingDidToHash(data.cid.path, data.identifier)

            const ddo = await IssuerService.resolve(data.identifier)
            console.log("ddo", ddo)
        }
    }
    const createIss = (item) => {
        createIssuer(item.name, item.category, item.domain, item.publicKey, item.email, item.id, item.date, item.website, item.phone)
        document.getElementById(item.id).disabled = true;
        document.getElementById(item.id + "a").disabled = true;
        swal("A new issuer has been created successfully!", "", "success");
    };

    const createIssuerFailed = async (email, id) => {
        const done = await IssuerService.createIssuerFailed(email, id)
        if (done) {
            console.log('success')
        }
    }
    const SendFailed = (item) => {
        createIssuerFailed(item.email, item.id)
        document.getElementById(item.id).disabled = true;
        document.getElementById(item.id + "a").disabled = true;
    }


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
                                        <h3 className="mb-0">DID Request</h3>
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
                                        <th scope="col">Address</th>
                                        <th scope="col">Public Key</th>
                                        <th scope="col">Organization Name</th>
                                        <th scope="col">Category</th>
                                        <th scope="col">Domain</th>
                                        <th scope="col">Description</th>
                                        <th scope="col">Creation Date</th>
                                        <th scope="col">Location</th>
                                        <th scope="col">Email</th>
                                        <th scope="col">Phone</th>
                                        <th scope="col">Website</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Actions</th>

                                    </tr>
                                </thead>
                                <tbody>{
                                    IssuerRequestsList.map((item, index) => {
                                        return item.state === parseInt(status) ? <tr key={index}>
                                            <td>{
                                                index + 1
                                            }</td>
                                            <td>{
                                                item.address === "" ? "Not defined" : item.address
                                            }</td>
                                            <td>{
                                                item.publicKey === "" ? "Not defined" : item.publicKey
                                            }</td>
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
                                                item.description
                                            }</td>
                                            <td>{
                                                item.dateCreation
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
                                                item.website
                                            }</td>
                                            <td>{
                                                item.state === 0 ? "Pending" : item.state === 1 ? "Issued" : "Declined"
                                            }</td>
                                            <td>
                                                <Button style={
                                                        {
                                                            background: "#d7363c",
                                                            color: "white"
                                                        }
                                                    }
                                                    id={
                                                        item.id
                                                    }
                                                    disabled={
                                                        item.state !== 0 ? true : false
                                                    }
                                                    onClick={
                                                        () => {
                                                            createIss(item)
                                                        }
                                                }>Create Identity</Button>
                                                <Button onClick={
                                                        () => SendFailed(item)
                                                    }
                                                    id={
                                                        item.id + "a"
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
            </Container>
        </>
    )
}

export default CreateIssuer
