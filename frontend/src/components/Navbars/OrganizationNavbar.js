import {Link} from "react-router-dom";
// reactstrap components
import {
    DropdownMenu,
    DropdownItem,
    UncontrolledDropdown,
    DropdownToggle,
    Navbar,
    Nav,
    Container,
    Media
} from "reactstrap";
import {useHistory} from 'react-router-dom';
import jwt from 'jwt-decode'
import { environment } from 'environment/env';

const OrganizationNavbar = (props) => {
    const history = useHistory();
    let token = jwt(sessionStorage.getItem("token"))
    const logOut = () => { 
      sessionStorage.clear()
      history.push('/');
    }
    const profile = () => {
      history.push('/organization/profile')
    }

    return (
        <>
            <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
                <Container fluid>
                    <Link className="h4 mb-0 text-white text-uppercase d-none d-lg-inline-block"
                    to={props.location.pathname}>
                        {
                        props.brandText
                    } </Link>
                    
                    <Nav className="align-items-center d-none d-md-flex" navbar>
                        <UncontrolledDropdown nav>
                            <DropdownToggle className="pr-0" nav>
                                <Media className="align-items-center">
                                    <span className="avatar avatar-sm">
                                      <img alt="..."
                                      src={`${environment.SERVER_API_URL}/image/` + token.res[0].logo} />
                                    </span>
                                    <Media className="ml-2 d-none d-lg-block">
                                        <span className="mb-0 text-sm font-weight-bold">
                                            {
                                            token.res[0].name
                                        } </span>
                                    </Media>
                                </Media>
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-arrow" right>
                                <DropdownItem className="noti-title" header tag="div">
                                    <h6 className="text-overflow m-0">Welcome!</h6>
                                </DropdownItem>
                                <DropdownItem divider/>

                                {/* <DropdownItem onClick={profile}>
                                    <i className="ni ni-single-02"/>
                                    <span>Profile</span>
                                </DropdownItem> */}

                                <DropdownItem onClick={logOut}>
                                    <i className="ni ni-user-run"/>
                                    <span>Logout</span>
                                </DropdownItem>

                            </DropdownMenu>
                        </UncontrolledDropdown>
                    </Nav>
                </Container>
            </Navbar>
        </>
    );
};

export default OrganizationNavbar;
