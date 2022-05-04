import {
  Container,
  Row, Col,
  Card, CardHeader
} from "reactstrap";
import PageHeader from "components/Headers/PageHeader.js";

const Index = () => {

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
                    <h3 className="mb-0">Home</h3>
                  </Col>
                </Row>
              </CardHeader>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default Index;
