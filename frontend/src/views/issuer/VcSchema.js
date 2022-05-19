import {
  Container, Row, Card, Col, CardHeader, CardBody, Button, Modal
} from "reactstrap";
import PageHeader from "components/Headers/PageHeader.js";
import { FormBuilder } from '@ginkgo-bioworks/react-json-schema-form-builder';
import { useState } from "react";
import VcSchemaService from "services/VcSchemaService";
const VcSchema = () => {
  const [schema, setSchema] = useState('')
  const [uischema, setUiSchema] = useState('')
  const [confirmModal, setConfirmModal] = useState(false)

  const createVcTemplate = async () => {
    console.log("schema", JSON.parse(schema))
    console.log("uischema", uischema)
    await VcSchemaService.createVcSchema(JSON.parse(schema))
    setSchema('')
    setUiSchema('')
    CloseConfirmModal()
  }

 /*  const customMods = {
    newElementDefaultDataOptions: {
      title: 'Claim',
    },
  }; */

const OpenConfirmModal = (id) => {
  setConfirmModal(true)
};
const CloseConfirmModal = () => {
  setConfirmModal(false)
}
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
                  <h3 className="mb-0">Create new Verifiable Credential Template</h3>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <FormBuilder
                schema={schema}
                uischema={uischema}
                onChange={(newSchema: string, newUiSchema: string) => {
                  setSchema(newSchema)
                  setUiSchema(newUiSchema)
                }}
              />
              <div className="text-center">{
              schema !== '' ? <Button style={{background:"#d7363c",color:"white"}} type="button"
                  onClick={OpenConfirmModal} 
                >
                  Submit
                </Button> :
                  <Button style={{background:"#d7363c",color:"white"}} type="button"
                    disabled
                  >
                    Submit
                  </Button>
              }</div>
            </CardBody>
          </Card>
        </div>
        <Modal
          className="modal-dialog-centered modal-danger"
          contentClassName="bg-primary"
          isOpen={confirmModal}
          toggle={CloseConfirmModal}
        >
          <div className="modal-header">
            <h6 className="modal-title" id="modal-title-notification">
              Create new Verifiable Credential Template
            </h6>
            <button
              aria-label="Close"
              className="close"
              data-dismiss="modal"
              type="button"
              onClick={CloseConfirmModal}
            >
              <span aria-hidden={true}>×</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="py-3 text-center">
              <i className="ni ni-check-bold ni-4x" />
              <h4 className="heading mt-4">Are you sure!</h4>
              <p>
                Review Credential Template
              </p>
            </div>
          </div>
          <div className="modal-footer">
            <Button className="btn-white" color="default" type="button" onClick={() => createVcTemplate()}>
              Confirm
            </Button>
            <Button
              className="text-white ml-auto"
              color="link"
              data-dismiss="modal"
              type="button"
              onClick={CloseConfirmModal}
            >
              Back
            </Button>
          </div>
        </Modal>
      </Row>
    </Container>
  </>
);
};

export default VcSchema;