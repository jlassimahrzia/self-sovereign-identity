/** Did Issuer routes */
import Index from "views/didIssuer/Index";
import CreateIdentity from "views/didIssuer/CreateIdentity";
import CreateIssuer from "views/didIssuer/CreateIssuer";
import CreateVerifier from "views/didIssuer/CreateVerifier";

/** Auth Routes */
import Login from "views/auth/Login"
import Register from "views/auth/Register";
import Password from "views/auth/Password";

/** Verifier Routes */
import IndexVerifier from "views/verifier/index";

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
    path: "/createVerifier",
    name: "Verifier DID request",
    icon: "ni ni-check-bold text-black",
    component: CreateVerifier,
    layout: "/issuer",
  },
  {
    path: "/login",
    component: Login,
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
  },
  {
    path: "/index",
    name: "Home",
    icon: "ni ni-tag text-black",
    component: IndexVerifier,
    layout: "/verifier",
  },
];
export default routes;

