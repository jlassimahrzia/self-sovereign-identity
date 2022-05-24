import Index from "views/Index.js";
import VC from "views/issuer/VC";
import VcSchema from "views/issuer/VcSchema.js";
import CreateCredential from "views/issuer/CreateCredential";
import Profile from "views/profile/Profile"
import IndexOrganization from "views/IndexOrganization";

var OrganizationRoutes = [

    {
        path: "/index",
        name: "Home",
        icon: "ni ni-tag text-black",
        component: IndexOrganization,
        layout: "/organization",
      },
      {
        path: "/vcSchema",
        name: "Verifiable Credential Schema",
        icon: "ni ni-credit-card text-black",
        component: VcSchema,
        layout: "/organization",
      },
      {
        path: "/ceateVc",
        name: "Create Verifiable Credential",
        icon: "ni ni-fat-add text-black",
        component: CreateCredential,
        layout: "/organization",
      },
      {
        path: "/vc",
        name: "Verifiable Credential Request",
        icon: "ni ni-check-bold text-black",
        component: VC,
        layout: "/organization",
      }, 
      {
        path: "/profile",
        name: "User Profile",
        icon: "ni ni-single-02 text-black",
        component: Profile,
        layout: "/organization",
      },
]

export default OrganizationRoutes