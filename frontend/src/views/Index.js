import { Fragment , useState , useEffect , useRef} from 'react'
import {
  Table,Container,Modal,
  Row,Col,
  Button,
  Card, CardHeader, Badge, ButtonGroup
} from "reactstrap";
import PageHeader from "components/Headers/PageHeader.js";
import DidService from 'services/DidService';
import QRCode from "qrcode.react";

const Index = () => {
  const qrRef = useRef();
  const [url, setUrl] = useState("");

  const [didRequestsList, setdidRequestsList] = useState([]);
  const [didRequest, setDidRequest] = useState(null);
  const [didModal, setDidModal] = useState(false);

  const retrieveDidRequestsList = async () => {
    const data = await DidService.getdidRequestList();
    setdidRequestsList([...data])
  }

  useEffect(() => {
    retrieveDidRequestsList();
  }, [])

  const createIdentity = async (publickey) => {
    const data = await DidService.createIdentity(publickey)
    console.log("data",data)
    if(data){
      const done = await DidService.mappingDidToHash(data.cid.path, data.identifier)
      if(done)
        setUrl({identifier: data.identifier})
      const ddo = await DidService.resolve(data.identifier)
      console.log("ddo",ddo)
    }
  }

  const OpenDidModal = (item) => {
    console.log(item.publickey)
    setDidRequest(item)
    setDidModal(true)
    createIdentity(item.publickey)
  };

  const CloseDidModal = () => {
    setDidModal(false)
  }

  const qrCode = (
    <QRCode
      id="qrCodeElToRender"
      size={500}
      value={JSON.stringify(url)}
      bgColor="white"
      fgColor="#141926"
      level="H"
    />
  );

  return (
    <>
        <PageHeader />
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
                      </Row>               
                  </CardHeader>
                  {/* List */}
                  <Table className="align-items-center table-flush" responsive>
                      <thead className="thead-light">
                      <tr>
                          <th scope="col"># </th>  
                          <th scope="col">Address </th>
                          <th scope="col">Public Key</th>
                          <th scope="col">Create Identity</th>
                      </tr>
                      </thead>
                      <tbody>
                      { didRequestsList.map((item,index) => (
                          <tr key={index} >
                            <td>{index+1}</td>
                            <td>
                              {item.address}
                            </td>
                            <td>
                              {item.publickey}
                            </td>
                            <td>
                              <Button color="info"
                                onClick={ () => OpenDidModal(item)}>create Identity</Button>
                            </td> 
                          </tr> 
                        ))}
                      </tbody>
                  </Table>
                </Card>
            </div> 
            <Modal className="modal-dialog-centered" size='lg' isOpen={didModal} toggle={CloseDidModal} >
              <div className="modal-header">
                <h4 className="modal-title" id="modal-title-default">
                  Scan QR code
                </h4>
                <button
                  aria-label="Close"
                  className="close"
                  data-dismiss="modal"
                  type="button"
                  onClick={CloseDidModal}
                >
                  <span aria-hidden={true}>×</span>
                </button>
              </div>
              <div className="modal-body">
                {url ?
                  <div className="qr-code" ref={qrRef}>
                    {qrCode}
                  </div> : null}
              </div>
              <div className="modal-footer" ref={qrRef}>
                <Button className="ml-auto" color="link" data-dismiss="modal" type="button" onClick={CloseDidModal}  >
                  Close
                </Button>
              </div>
            </Modal> 
        </Row>
        </Container>
    </>
  );
};

export default Index;
