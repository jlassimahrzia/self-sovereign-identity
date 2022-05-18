import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";
import "antd/dist/antd.css";
import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js";
import Login from "views/login/Login.js"
import Password from "views/password/Password.js"

import "assets/css/custom-styles.css";
import Register from "views/register/Register.js";

import Profile from "views/examples/Profile";
import OrganizationLayout from "layouts/OrganizationLayout";
import Home from "views/home/Home";

ReactDOM.render(
  <BrowserRouter>
    <Switch>
    <Route path="/home" render={(props) => <Home {...props} />} />
      <Route path="/issuer" render={(props) => <AdminLayout {...props} />} />
      <Route path="/organization" render={(props) => <OrganizationLayout {...props} />} />
      <Route path="/profile" render={(props) => <Profile {...props} />} />
      <Route path="/register" render={(props)=><Register {...props} />} />
      <Route path="/auth" render={(props) => <AuthLayout {...props} />} />
      <Route path="/login" render={(props) => <Login {...props} />} />
      <Route path="/password/:id" render={(props) => <Password {...props} />} />

      <Redirect from="/" to="/issuer/index" />
    </Switch>
  </BrowserRouter>,
  document.getElementById("root")
);
