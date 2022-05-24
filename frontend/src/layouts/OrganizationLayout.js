import React from "react";
import { useLocation, Route, Switch, Redirect } from "react-router-dom";
// reactstrap components
import { Container } from "reactstrap";
// core components
import AdminNavbar from "components/Navbars/AdminNavbar.js";
//import AdminFooter from "components/Footers/AdminFooter.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import OrganizationRoutes from "routes-organization.js";
import OrganizationNavbar from "components/Navbars/OrganizationNavbar";

const OrganizationLayout = (props) => {
  const mainContent = React.useRef(null);
  const location = useLocation();

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContent.current.scrollTop = 0;
  }, [location]);


  
  const getRoutes = (OrganizationRoutes) => {
    return OrganizationRoutes.map((prop, key) => {
      if (prop.layout === "/organization") {
        return (
          <Route
            exact
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      } else {
        return null;
      }
    }); 
  };

  const getBrandText = (path) => {
    for (let i = 0; i < OrganizationRoutes.length; i++) {
      if (
        props.location.pathname.indexOf(OrganizationRoutes[i].layout + OrganizationRoutes[i].path) !==
        -1
      ) {
        return OrganizationRoutes[i].name;
      }
    }
    return "Brand";
  };

  return (
    <>
      <Sidebar
        {...props}
        routes={OrganizationRoutes}
        logo={{
          innerLink: "/organization/index",
          imgSrc: require("../assets/img/brand/argon-react.png").default,
          imgAlt: "...",
        }}
      />
      <div className="main-content" ref={mainContent}>
        <OrganizationNavbar
          {...props}
          brandText={getBrandText(props.location.pathname)}
        />
        <Switch>
          {getRoutes(OrganizationRoutes)}
          <Redirect from="*" to="/organization/index" />
        </Switch>
        <Container fluid>
        {/* <AdminFooter /> */}
        </Container>
      </div>
    </>
  );
};

export default OrganizationLayout;
