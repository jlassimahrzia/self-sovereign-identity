
import IndexVerifier from "views/verifier/index"
import VpSchema from "views/verifier/vpSchema"
import ServicesRequest from "views/verifier/ServicesRequest";
import VerificationResponse from "views/verifier/VerificationResponse";
import Profile from "views/profile/Profile"

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
  {
    path: "/verificationResponse",
    name: "Verification Response",
    icon: "ni ni-curved-next text-black",
    component: VerificationResponse,
    layout: "/verifier",
  },
  {
    path: "/profile",
    name: "Settings",
    icon: "ni ni-settings-gear-65 text-black",
    component: Profile,
    layout: "/verifier",
  }
];
export default VerifierRoutes;

