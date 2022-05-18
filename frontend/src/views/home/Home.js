import { Navbar } from 'responsive-navbar-react'
import 'responsive-navbar-react/dist/index.css'

const Home = () => {
  const props = {
    items: [
      {
        text: 'Home',
        link: '/'
      },
      {
        text: 'Register',
        link: '/register'
      },
      {
        text: 'Login',
        link: '/login'
      },
      {
        text: 'Contact',
        link: '#contact'
      }
    ],
    logo: {
        img: require("../../assets/img/brand/argon-react.png").default, 
        imgAlt: "...",
        background:"white"
        
    },
    style: {
      barStyles: {
        background: '#d7363c'
      },
      sidebarStyles: {
        background: '#d7363c',
        buttonColor: 'white'
      }
    }
  }
  return <Navbar {...props} />
}

export default Home