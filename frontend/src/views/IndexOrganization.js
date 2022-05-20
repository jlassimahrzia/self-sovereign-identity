import React from 'react'
import PageHeader from 'components/Headers/PageHeader'
import { useState } from "react";
// node.js library that concatenates classes (strings)
import classnames from "classnames";
// javascipt plugin for creating charts
import Chart from "chart.js";
// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";
import {
    Card,
    CardHeader,
    CardBody,
    Container,
    CardTitle,
    Row,
    Col,
  } from "reactstrap";
  import {
    chartOptions,
    parseOptions,
    chartExample2,
  } from "variables/charts.js";
  
 
function IndexOrganization() {
  const [activeNav, setActiveNav] = useState(1);
  const [chartExample1Data, setChartExample1Data] = useState("data1");

  if (window.Chart) {
    parseOptions(Chart, chartOptions());
  }


  return (
    <>
    <PageHeader/>
    
    <Container className="mt--7" fluid>
    <div className="header-body">
    {/* Card stats */}
    <Row>
      <Col lg="12" xl="6">
        <Card className="card-stats mb-4 mb-xl-0">
          <CardBody>
            <Row>
              <div className="col">
                <CardTitle
                  tag="h5"
                  className="text-uppercase text-muted mb-0"
                >
                  VC requests
                </CardTitle>
                <span className="h2 font-weight-bold mb-0">
                  20
                </span>
              </div>
              <Col className="col-auto">
              <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                  <i className="fas fa-chart-bar" />
              </div>
                
              </Col>
            </Row>
            <p className="mt-3 mb-0 text-muted text-sm">
              <span className="text-success mr-2">
                <i className="fa fa-arrow-up" /> 3.48%
              </span>{" "}
              <span className="text-nowrap">Since last month</span>
            </p>
          </CardBody>
        </Card>
      </Col>
      <Col lg="12" xl="6">
        <Card className="card-stats mb-4 mb-xl-0">
          <CardBody>
            <Row>
              <div className="col">
                <CardTitle
                  tag="h5"
                  className="text-uppercase text-muted mb-0"
                >
                  Schemas
                </CardTitle>
                <span className="h2 font-weight-bold mb-0">3</span>
              </div>
              <Col className="col-auto">
                <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                  <i className="fas fa-chart-pie" />
                </div>
              </Col>
            </Row>
            <p className="mt-3 mb-0 text-muted text-sm">
              <span className="text-danger mr-2">
                <i className="fas fa-arrow-down" /> 3.48%
              </span>{" "}
              <span className="text-nowrap">Since last week</span>
            </p>
          </CardBody>
        </Card>
      </Col>
    
   
    </Row>
    <br/>
    <Row>

    <Col xl="12">
      <Card className="shadow">
        <CardHeader className="bg-transparent">
          <Row className="align-items-center">
            <div className="col">
              <h6 className="text-uppercase text-muted ls-1 mb-1">
                Status
              </h6>
              <h2 className="mb-0">VC requests</h2>
            </div>
          </Row>
        </CardHeader>
        <CardBody>
          {/* Chart */}
          <div className="chart">
            <Bar
              data={chartExample2.data}
              options={chartExample2.options}
            />
          </div>
        </CardBody>
      </Card>
    </Col>
  </Row>
  </div>
      </Container>
      </>
  )
}

export default IndexOrganization