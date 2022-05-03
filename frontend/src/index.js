import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";
import "antd/dist/antd.css";
import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js";
import Login from "views/examples/Login.js"
import "assets/css/custom-styles.css";

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route path="/issuer" render={(props) => <AdminLayout {...props} />} />

      <Route path="/auth" render={(props) => <AuthLayout {...props} />} />
      <Route path="/login" render={(props) => <Login {...props} />} />
      <Redirect from="/" to="/issuer/index" />
    </Switch>
  </BrowserRouter>,
  document.getElementById("root")
);
