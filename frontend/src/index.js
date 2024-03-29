import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";
import "antd/dist/antd.css";
import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js";



import "assets/css/custom-styles.css";

import OrganizationLayout from "layouts/OrganizationLayout";
import Profile from "views/profile/Profile"
import VerifierLayout from "layouts/VerifierLayout"

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route path="/issuer" render={(props) => <AdminLayout {...props} />} />
      <Route path="/organization" render={(props) => <OrganizationLayout {...props} />} />
      <Route path="/profile" render={(props) => <Profile {...props} />} />
      <Route path="/verifier" render={(props) => <VerifierLayout {...props} />} />
      <Route path="/auth" render={(props) => <AuthLayout {...props} />} />
      <Redirect from="/" to="/auth/login" />
    </Switch>
  </BrowserRouter>,
  document.getElementById("root")
);
