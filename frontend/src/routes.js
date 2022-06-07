import Index from "views/didIssuer/Index";
import CreateIdentity from "views/didIssuer/CreateIdentity";
import CreateIssuer from "views/didIssuer/CreateIssuer";
import VC from "views/issuer/VC";
import VcSchema from "views/issuer/VcSchema.js";

/** Auth Routes */
import Log from "views/auth/Log"
import Register from "views/auth/Register";
import Password from "views/auth/Password";

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
    icon: "ni ni-building text-black",
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

