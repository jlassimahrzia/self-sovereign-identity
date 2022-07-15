import React from 'react'
import PageHeader from 'components/Headers/PageHeader'
//import { useState } from "react";
// node.js library that concatenates classes (strings)
//import classnames from "classnames";
// javascipt plugin for creating charts
import Chart from "chart.js";
// react plugin used to create charts
import { Bar } from "react-chartjs-2";
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
  } from "variables/charts.js";
  import VCService from 'services/VCService';
import jwt from 'jwt-decode'
import { useState, useEffect } from 'react';
import VcSchemaService from 'services/VcSchemaService';

function IndexOrganization() {


  if (window.Chart) {
    parseOptions(Chart, chartOptions());
  }
  const [vcsIssued, setvcsIssued] = useState([]);
  const [vcsPending, setvcsPending] = useState([]);
  const [vcsDeclined, setvcsDeclined] = useState([]);

  const [schemasList, setSchemasList] = useState([]);

  const retrieveSchemasList = async () => {
    let data = await VcSchemaService.getSchemas()
    if(data.length > 0){
      let finalRes = [];
      data.forEach(schemaRes => {
          let name = schemaRes[0];
          let path = schemaRes[1];
          let result = {
              name,
              path
          }
          finalRes.push(result);
      });
      return finalRes;
    }
    else {
      return []
    }
}

  const retrieveVcRequestsList = async () => {
    let didIssuer = (jwt(sessionStorage.getItem("token"))).res[0].did
    let data = await VCService.getVCRequestList(didIssuer);
    let dataIssued = data.filter(vc => vc.state === 1)
    setvcsIssued(dataIssued)
    let dataPending = data.filter(vc => vc.state === 0)
    setvcsPending(dataPending)
    let dataDeclined = data.filter(vc => vc.state === 2)
    setvcsDeclined(dataDeclined)
  }

  const [chartExample2, setchartExample2] = useState()

  useEffect(() => {
    retrieveVcRequestsList()
    retrieveSchemasList().then((res) => {
      setSchemasList(res);
    });
    
    setchartExample2({
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
            data: [vcsPending.length, vcsIssued.length, vcsDeclined.length],
            maxBarThickness: 10,
          },
        ],
      },
    })
  }, [])
  
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
                  Verifiable Credential Issued
                </CardTitle>
                <span className="h2 font-weight-bold mb-0">
                  {vcsIssued.length}
                </span>
              </div>
              <Col className="col-auto">
              <div className="icon icon-shape bg-info text-white rounded-circle shadow">
              <i className="ni ni-credit-card"></i>
              </div>
                
              </Col>
            </Row>
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
                <span className="h2 font-weight-bold mb-0">{schemasList.length}</span>
              </div>
              <Col className="col-auto">
                <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                  <i className="ni ni-single-copy-04" />
                </div>
              </Col>
            </Row>
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