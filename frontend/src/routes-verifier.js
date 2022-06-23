
import IndexVerifier from "views/verifier/index"
import VpSchema from "views/verifier/vpSchema"
import ServicesRequest from "views/verifier/ServicesRequest";

var VerifierRoutes = [
 
  {
    path: "/index",
    name: "Home",
    icon: "ni ni-tag text-black",
    component: IndexVerifier,
    layout: "/verifier",
  },
  {
    path: "/vpSchema",
    name: "Verification Templates",
    icon: "ni ni-paper-diploma text-black",
    component: VpSchema,
    layout: "/verifier",
  },
  {
    path: "/servicesRequest",
    name: "Services Requests",
    icon: "ni ni-app text-black",
    component: ServicesRequest,
    layout: "/verifier",
  },
];
export default VerifierRoutes;

