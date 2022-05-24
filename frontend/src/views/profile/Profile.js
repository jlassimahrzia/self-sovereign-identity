import React from 'react'
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    FormGroup,
    Form,
    Input,
    Container,
    Row,
    Col,
  } from "reactstrap";
  // core components
  import jwt from 'jwt-decode' 
  import PageHeader from 'components/Headers/PageHeader';
  

function Profile() {


    const token = jwt(sessionStorage.getItem("token")) 
    
   console.log(token)

  return (

    <div>       
    <PageHeader/>
    <Container className="mt--7" fluid>
    
    <Col className="order-xl-1" xl="12">
    <Card className="bg-secondary shadow">
      <CardHeader className="bg-white border-0">
        <Row className="align-items-center">
          <Col xs="8">
            <h3 className="mb-0">My account</h3>
          </Col>
          <Col className="text-right" xs="4">
            <Button
              color="primary"
              href="#pablo"
              onClick={(e) => e.preventDefault()}
              size="sm"
            >
              Settings
            </Button>
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        <Form>
          <h6 className="heading-small text-muted mb-4">
            User information
          </h6>
          <div className="pl-lg-4">
            <Row>
              <Col lg="6">
                <FormGroup>
                  <label
                    className="form-control-label"
                    htmlFor="input-username"
                  >
                    Name
                  </label>
                  <Input
                  value={token.res[0].name}
                    className="form-control-alternative"
                    defaultValue="lucky.jesse"
                    id="input-username"
                    placeholder="Username"
                    type="text"
                  />
                </FormGroup>
              </Col>
              <Col lg="6">
                <FormGroup>
                  <label
                    className="form-control-label"
                    htmlFor="input-email"
                  >
                    Identifier
                  </label>
                  <Input
                  value={token.res[0].did}
                    className="form-control-alternative"
                    id="input-email"
                    placeholder="jesse@example.com"
                    type="text"
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col lg="6">
                <FormGroup>
                  <label
                    className="form-control-label"
                    htmlFor="input-first-name"
                  >
                    Category
                  </label>
                  <Input
                    className="form-control-alternative"
                    defaultValue="Lucky"
                    value={token.res[0].category}
                    id="input-first-name"
                    placeholder="First name"
                    type="text"
                  />
                </FormGroup>
              </Col>
              <Col lg="6">
                <FormGroup>
                  <label
                    className="form-control-label"
                    htmlFor="input-last-name"
                  >
                    Domain
                  </label>
                  <Input
                    className="form-control-alternative"
                    defaultValue="Jesse"
                    value={token.res[0].domain}
                    id="input-last-name"
                    placeholder="Last name"
                    type="text"
                  />
                </FormGroup>
              </Col>
            </Row>
          </div>
          <hr className="my-4" />
          {/* Address */}
          <h6 className="heading-small text-muted mb-4">
            Contact information
          </h6>
          <div className="pl-lg-4">
            <Row>
              <Col md="6">
                <FormGroup>
                  <label
                    className="form-control-label"
                    htmlFor="input-address"
                  >
                    Email
                  </label>
                  <Input
                    className="form-control-alternative"
                    defaultValue="jesse@example.com"
                    value={token.res[0].email}
                    id="input-address"
                    placeholder="Home Address"
                    type="text"
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label
                    className="form-control-label"
                    htmlFor="input-address"
                  >
                   Location
                  </label>
                  <Input
                    className="form-control-alternative"
                    defaultValue="jesse@example.com"
                    value={token.res[0].location}
                    id="input-address"
                    placeholder="Home Address"
                    type="text"
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col lg="4">
                <FormGroup>
                  <label
                    className="form-control-label"
                    htmlFor="input-city"
                  >
                    Website
                  </label>
                  <Input
                    className="form-control-alternative"
                    defaultValue="New York"
                    id="input-city"
                    placeholder="City"
                    value={token.res[0].website}
                    type="text"
                  />
                </FormGroup>
              </Col>
              <Col lg="4">
                <FormGroup>
                  <label
                    className="form-control-label"
                    htmlFor="input-city"
                  >
                    Creation date
                  </label>
                  <Input
                    className="form-control-alternative"
                    defaultValue="New York"
                    id="input-city"
                    placeholder="City"
                    value={token.res[0].dateCreation}
                    type="text"
                  />
                </FormGroup>
              </Col>
              <Col lg="4">
                <FormGroup>
                  <label
                    className="form-control-label"
                    htmlFor="input-country"
                  >
                   Phone Number
                  </label>
                  <Input
                    className="form-control-alternative"
                    defaultValue="United States"
                    id="input-country"
                    placeholder="Country"
                    value={token.res[0].phone}
                    type="text"
                  />
                </FormGroup>
              </Col>
         
            </Row>
          </div>
          <hr className="my-4" />
          {/* Description */}
          <h6 className="heading-small text-muted mb-4">About me</h6>
          <div className="pl-lg-4">
            <FormGroup>
              <label className="form-control-label"
              htmlFor="input-country">Description</label>
              <Input
                className="form-control-alternative"
                placeholder="A few words about you ..."
                rows="4"
                value={token.res[0].description}
                type="textarea"
              />
            </FormGroup>
          </div>
        </Form>
      </CardBody>
    </Card>
  </Col>
  
  </Container>
  </div>
  )
}

export default Profile