import VC from "views/issuer/VC";
import VcSchema from "views/issuer/VcSchema.js";
import VcSchemaList from "views/issuer/VcSchemaList";
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
        name: "Create Credential Schema",
        icon: "ni ni-fat-add text-black",
        component: VcSchema,
        layout: "/organization",
      },
      {
        path: "/vcSchemalist",
        name: "Credentials Schema List",
        icon: "ni ni-credit-card text-black",
        component: VcSchemaList,
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
      }
]

export default OrganizationRoutes