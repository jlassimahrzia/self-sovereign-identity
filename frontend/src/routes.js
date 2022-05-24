import Index from "views/Index.js";
import CreateIdentity from "views/issuer/CreateIdentity.js";
import VC from "views/issuer/VC";
import VcSchema from "views/issuer/VcSchema.js";
import CreateCredential from "views/issuer/CreateCredential";
import CreateIssuer from "views/issuer/CreateIssuer";
import Log from "views/examples/Log";
import Register from "views/examples/Register";
import Password from "views/password/Password";

var routes = [
  {
    path: "/index",
    name: "Home",
    icon: "ni ni-tag text-black",
    component: Index,
    layout: "/issuer",
  },
  {
    path: "/createIdentity",
    name: "Holder DID request",
    icon: "ni ni-single-02 text-black",
    component: CreateIdentity,
    layout: "/issuer",
  },

  {
    path: "/createIssuer",
    name: "Issuer DID Request",
    icon: "ni ni-air-baloon text-black",
    component: CreateIssuer,
    layout: "/issuer",
  }, 
  {
    path: "/login",
    component: Log,
    layout: "/auth",
  },
  {
    path: "/register",
    component: Register,
    layout: "/auth",
  },

  {
    path: "/password/:id",
    component: Password,
    layout: "/auth",
  }
];
export default routes;

