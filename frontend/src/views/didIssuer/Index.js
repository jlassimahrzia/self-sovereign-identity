import { useState } from "react";
// node.js library that concatenates classes (strings)
import classnames from "classnames";
// javascipt plugin for creating charts
import Chart from "chart.js";
// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";
// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  NavItem,
  NavLink,
  Nav,
  Container,
  Row,CardTitle,
  Col,
} from "reactstrap";

// core components
import {
  chartOptions,
  parseOptions,
  chartExample1,
  chartExample2,
} from "variables/charts.js";

import { useEffect } from "react";
import PageHeader from "components/Headers/PageHeader";

import DidService from "services/DidService";
import IssuerService from "services/IssuerService";
import VerifierService from "services/VerifierService";
const Index = (props) => {

  if (window.Chart) {
    parseOptions(Chart, chartOptions());
  }

  const [HolderIssued, setHolderIssued] = useState([]);
  const [HolderPending, setHolderPending] = useState([]);
  const [HolderDeclined, setHolderDeclined] = useState([]);
  const [HolderChart, setHolderChart] = useState()

  const retrieveDidRequestsList = async () => {
    let data = await DidService.getdidRequestList();
    let dataIssued = data.filter(vc => vc.state === 1)
    setHolderIssued(dataIssued)
    let dataPending = data.filter(vc => vc.state === 0)
    setHolderPending(dataPending)
    let dataDeclined = data.filter(vc => vc.state === 2)
    setHolderDeclined(dataDeclined)
    setHolderChart({
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                callback: function (value) {
                  if (!(value % 10)) {
                    //return '$' + value + 'k'
                    return value;
                  }
                },
              },
            },
          ],
        },
        tooltips: {
          callbacks: {
            label: function (item, data) {
              var label = data.datasets[item.datasetIndex].label || "";
              var yLabel = item.yLabel;
              var content = "";
              if (data.datasets.length > 1) {
                content += label;
              }
              content += yLabel;
              return content;
            },
          },
        },
      },
      data: {
        labels: ["Pending", "Issued", "Declined"],
        datasets: [
          {
            label: "Sales",
            data: [HolderPending.length, HolderIssued.length, HolderDeclined.length],
            maxBarThickness: 5,
          },
        ],
      },
    })
  }

  const [IssuerIssued, setIssuerIssued] = useState([]);
  const [IssuerPending, setIssuerPending] = useState([]);
  const [IssuerDeclined, setIssuerDeclined] = useState([]);
  const [IssuerChart, setIssuerChart] = useState()

  const retrieveIssuerDidRequestsList = async () => {
    let data = await IssuerService.getIssuersList();
    let dataIssued = data.filter(vc => vc.state === 1)
    setIssuerIssued(dataIssued)
    let dataPending = data.filter(vc => vc.state === 0)
    setIssuerPending(dataPending)
    let dataDeclined = data.filter(vc => vc.state === 2)
    setIssuerDeclined(dataDeclined)
    setIssuerChart({
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                callback: function (value) {
                  if (!(value % 10)) {
                    //return '$' + value + 'k'
                    return value;
                  }
                },
              },
            },
          ],
        },
        tooltips: {
          callbacks: {
            label: function (item, data) {
              var label = data.datasets[item.datasetIndex].label || "";
              var yLabel = item.yLabel;
              var content = "";
              if (data.datasets.length > 1) {
                content += label;
              }
              content += yLabel;
              return content;
            },
          },
        },
      },
      data: {
        labels: ["Pending", "Issued", "Declined"],
        datasets: [
          {
            label: "Sales",
            data: [IssuerPending.length, IssuerIssued.length, IssuerDeclined.length],
            maxBarThickness: 5,
          },
        ],
      },
    })
  }

  const [VerifierIssued, setVerifierIssued] = useState([]);
  const [VerifierPending, setVerifierPending] = useState([]);
  const [VerifierDeclined, setVerifierDeclined] = useState([]);
  const [VerifierChart, setVerifierChart] = useState()

  const retrieveVerifierDidRequestsList = async () => {
    let data = await VerifierService.getVerifierList();
    let dataIssued = data.filter(vc => vc.state === 1)
    setVerifierIssued(dataIssued)
    let dataPending = data.filter(vc => vc.state === 0)
    setVerifierPending(dataPending)
    let dataDeclined = data.filter(vc => vc.state === 2)
    setVerifierDeclined(dataDeclined)
    setVerifierChart({
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                callback: function (value) {
                  if (!(value % 10)) {
                    //return '$' + value + 'k'
                    return value;
                  }
                },
              },
            },
          ],
        },
        tooltips: {
          callbacks: {
            label: function (item, data) {
              var label = data.datasets[item.datasetIndex].label || "";
              var yLabel = item.yLabel;
              var content = "";
              if (data.datasets.length > 1) {
                content += label;
              }
              content += yLabel;
              return content;
            },
          },
        },
      },
      data: {
        labels: ["Pending", "Issued", "Declined"],
        datasets: [
          {
            label: "Sales",
            data: [VerifierPending.length, VerifierIssued.length, VerifierDeclined.length],
            maxBarThickness: 5,
          },
        ],
      },
    })
  }

  useEffect( async() => {
    await retrieveDidRequestsList();
    await retrieveIssuerDidRequestsList();
    await retrieveVerifierDidRequestsList();
  }, [])
 
  return (
    <>
      <PageHeader/>
      {/* Page content */}
      <Container className="mt--7" fluid>
      <Row>
      <Col lg="12" xl="4">
        <Card className="card-stats mb-4 mb-xl-0">
          <CardBody>
            <Row>
              <div className="col">
                <CardTitle
                  tag="h5"
                  className="text-uppercase text-muted mb-0"
                >
                  Holders
                </CardTitle>
                <span className="h2 font-weight-bold mb-0">
                  {HolderIssued.length}
                </span>
              </div>
              <Col className="col-auto">
              <div className="icon icon-shape bg-info text-white rounded-circle shadow">
              <i className="ni ni-single-02"></i>
              </div>
                
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
      <Col lg="12" xl="4">
         <Card className="card-stats mb-4 mb-xl-0">
          <CardBody>
            <Row>
              <div className="col">
                <CardTitle
                  tag="h5"
                  className="text-uppercase text-muted mb-0"
                >
                  Issuers
                </CardTitle>
                <span className="h2 font-weight-bold mb-0">{IssuerIssued.length}</span>
              </div>
              <Col className="col-auto">
                <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                  <i className="ni ni-building" />
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
      <Col lg="12" xl="4">
        <Card className="card-stats mb-4 mb-xl-0">
          <CardBody>
            <Row>
              <div className="col">
                <CardTitle
                  tag="h5"
                  className="text-uppercase text-muted mb-0"
                >
                  Verifiers
                </CardTitle>
                <span className="h2 font-weight-bold mb-0">
                  {VerifierIssued.length}
                </span>
              </div>
              <Col className="col-auto">
              <div className="icon icon-shape bg-info text-white rounded-circle shadow">
              <i className="ni ni-check-bold"></i>
              </div>
                
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>

    </Row>
    <br/>
        <Row>
        <Col xl="4">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                      Status
                    </h6>
                    <h2 className="mb-0">Holder DID requests</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                {/* Chart */}
                <div className="chart">
                  <Bar
                    data={HolderChart?.data}
                    options={HolderChart?.options}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl="4">
           <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                      Status
                    </h6>
                    <h2 className="mb-0">Issuer DID requests</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                {/* Chart */}
                <div className="chart">
                  <Bar
                    data={IssuerChart?.data}
                    options={IssuerChart?.options}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                      Status
                    </h6>
                    <h2 className="mb-0">Verifier DID requests</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                {/* Chart */}
                <div className="chart">
                  <Bar
                    data={VerifierChart?.data}
                    options={VerifierChart?.options}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>    
      </Container>
    </>
  );

};

export default Index;
