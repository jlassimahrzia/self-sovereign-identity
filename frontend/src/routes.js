/*!

=========================================================
* Argon Dashboard React - v1.2.1
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2021 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Icons from "views/examples/Icons";
import Index from "views/Index.js";
import CreateIdentity from "views/issuer/CreateIdentity.js";
import VC from "views/issuer/VC";
import VcSchema from "views/issuer/VcSchema.js";

var routes = [
  /* , */
  {
    path: "/index",
    name: "Home",
    icon: "ni ni-tag text-black",
    component: Index,
    layout: "/issuer",
  },
  {
    path: "/createIdentity",
    name: "Create identity",
    icon: "ni ni-single-02 text-black",
    component: CreateIdentity,
    layout: "/issuer",
  },
  {
    path: "/vcSchema",
    name: "Verifiable Credential Schema",
    icon: "ni ni-credit-card text-black",
    component: VcSchema,
    layout: "/issuer",
  },
  {
    path: "/vc",
    name: "Verifiable Credential",
    icon: "ni ni-check-bold text-black",
    component: VC,
    layout: "/issuer",
  }
  
  /* {
    path: "/icons",
    name: "Icons",
    icon: "ni ni-planet text-blue",
    component: Icons,
    layout: "/admin",
  },
  {
    path: "/maps",
    name: "Maps",
    icon: "ni ni-pin-3 text-orange",
    component: Maps,
    layout: "/admin",
  },
  {
    path: "/user-profile",
    name: "User Profile",
    icon: "ni ni-single-02 text-yellow",
    component: Profile,
    layout: "/admin",
  },
  {
    path: "/tables",
    name: "Tables",
    icon: "ni ni-bullet-list-67 text-red",
    component: Tables,
    layout: "/admin",
  },
  {
    path: "/login",
    name: "Login",
    icon: "ni ni-key-25 text-info",
    component: Login,
    layout: "/auth",
  },
  {
    path: "/register",
    name: "Register",
    icon: "ni ni-circle-08 text-pink",
    component: Register,
    layout: "/auth",
  }, */
];
export default routes;
