import {useEffect, useState} from "react";
import {
  StyleSheet,
  Dimensions,
  Image,
  FlatList,
  TouchableWithoutFeedback, Linking, Platform
} from "react-native";
import { Block, Text, theme } from "galio-framework";
// butoane text mai gros ca la register screen
import { Card, Select, Button } from "../components/";
import { cart } from "../constants/cart";
import { Images, argonTheme } from "../constants";
import Icon from '../components/Icon';
import { AntDesign, MaterialCommunityIcons , Ionicons} from '@expo/vector-icons'; 
import ViewMoreText from 'react-native-view-more-text';
const { width } = Dimensions.get("screen");


renderViewMore = (onPress) => {
  return(
    <Text onPress={onPress} color={argonTheme.COLORS.PRIMARY}>View more</Text>
  )
}
renderViewLess = (onPress) =>{
  return(
    <Text onPress={onPress} color={argonTheme.COLORS.PRIMARY}>View less</Text>
  )
}

renderProduct = ({ item }) => {
    //const { navigation } = this.props;
    const openTel = number => {
      let phoneNumber = ''
      if (Platform.OS === 'android') {
        phoneNumber = `tel:${number}`
      } else {
        phoneNumber = `telprompt:${number}`
      }
      Linking.openURL(phoneNumber)
    }
    
    const openUrl = url => {
      Linking.openURL(url)
    }
    
    const openEmail = mail => {
      Linking.openURL('mailto:' + mail)
    }
    
    const openMap = address => {
      Linking.openURL('https://www.google.com/maps/search/?api=1&query=' + address)
    }
    
    return (
      <Block>
        <Block card shadow style={styles.product}>
            <Block flex row>
                {/* <TouchableWithoutFeedback
                onPress={() => navigation.navigate("Product", { product: item })}
                > */}
                <Block style={styles.imageHorizontal}>
                    <Image
                    source={Image.logoCNSS}
                    style={styles.imageStyle}
                    />
                </Block>
                {/*  </TouchableWithoutFeedback> */}
                <Block flex style={styles.productDescription}>
                  <Block
                    middle
                    row
                    space="evenly"
                  >
                  <Text size={14} style={styles.productTitle} color={argonTheme.COLORS.PRIMARY}
                  style={{fontWeight: "bold",margin: 5}}>
                    {item.name}
                  </Text>
                  </Block>
                  <Block
                    middle
                    row
                    space="evenly"
                  >
                    <Button
                      small
                      style={{ backgroundColor: argonTheme.COLORS.DEFAULT }}
                      icon="mail" iconFamily="antdesign" iconSize={13} iconColor="#fff"
                      onPress={() => openEmail(item.email)}
                    >
                      Email
                    </Button>
                    <Button
                      small
                      style={{ backgroundColor: argonTheme.COLORS.DEFAULT }}
                      icon="link" iconFamily="antdesign" iconSize={13} iconColor="#fff"
                      onPress={() => openUrl(item.site)}
                    >
                      Website
                    </Button>
                  </Block>  
                  <Block
                    middle
                    row
                    space="evenly"
                  >
                    <Button
                      small
                      style={{ backgroundColor: argonTheme.COLORS.DEFAULT }}
                      icon="home" iconFamily="antdesign" iconSize={13} iconColor="#fff"
                      onPress={() => openMap(item.address)}
                    >
                      Address
                    </Button>
                    <Button
                      small
                      style={{ backgroundColor: argonTheme.COLORS.DEFAULT }}
                      icon="mobile1" iconFamily="antdesign" iconSize={13} iconColor="#fff"
                      onPress={() => openTel(item.tel)}
                    >
                      Mobile
                    </Button>
                  </Block>  
                </Block>
            </Block>
            <Block flex style={styles.productDescription}>
                    <ViewMoreText
                      numberOfLines={2}
                      renderViewMore={renderViewMore}
                      renderViewLess={renderViewLess}
                    >
                      <Text size={14} style={styles.productTitle} muted style={{margin: 3, textAlign: "justify"}}>
                        {item.description}
                      </Text>
                    </ViewMoreText>
            </Block>
        </Block>
      </Block>
    );
};

renderEmpty = () => {
    return <Text style={{ fontFamily: 'open-sans-regular' }} color={argonTheme.COLORS.ERROR}>The cart is empty</Text>;
}

function Organisations() {

    const [organisations, setOrganisations] = useState([])

    let data = [
        {
            id: 1,
            name: "Municipalité De Tunis",
            description: "L'Association de la sauvegarde de la médina, l'Agence municipale de gestion et l'Agence municipale des services environnementaux sont trois établissements municipaux.",
            address: "Avenue 2 Mars 1934 1008 - la Kasbah Tunis",
            tel: "71571198",
            email: "Webmaster@commune-tunis.gov.tn",
            site: "http://www.commune-tunis.gov.tn",
            date_creation: "10/05/2022",
            category: "Municipal Affairs",
            logo: `${Image.logoMunicipalite}`
        },
        {
          id: 2,
          name: "Caisse Nationale de Sécurité Sociale",
          description: "La CNSS a été instituée en vertu de  la loi n°60-30 du 14 décembre 1960 .La CNSS est un établissement public doté de la personnalité civile et de l'autonomie financière et rattaché au Ministère des Affaires Sociales.",
          address: "49, avenue Taïeb M'hiri. 1002 Tunis",
          tel: "71796744",
          email: "cnss.dg@cnss.nat.tn",
          site: "https://www.cnss.tn/fr/",
          date_creation: "10/05/2022",
          category: "National Security",
          logo: `${Image.logoCNSS}`
        }
    ]


    useEffect(() => {
        setOrganisations(data)
        console.log("Organisations : ",organisations)
    }, [])

    return (
      <Block flex center style={styles.cart}>
        <FlatList
          data={organisations}
          renderItem={renderProduct}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => `${index}-${item.title}`}
          ListEmptyComponent={renderEmpty}
        />
      </Block>
  );
}

const styles = StyleSheet.create({
  cart: {
    width: width
  },
  header: {
    marginTop: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE
  },
  footer: {
    marginBottom: theme.SIZES.BASE * 2
  },
  divider: {
    height: 1,
    backgroundColor: argonTheme.COLORS.INPUT,
    marginVertical: theme.SIZES.BASE
  },
  checkoutWrapper: {
    paddingTop: theme.SIZES.BASE * 2,
    margin: theme.SIZES.BASE,
    borderStyle: "solid",
    borderTopWidth: 1,
    borderTopColor: argonTheme.COLORS.INPUT
  },
  products: {
    minHeight: "100%"
  },
  product: {
    width: width * 0.9,
    borderWidth: 0,
    marginVertical: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: theme.SIZES.BASE / 4,
    shadowOpacity: 0.1
  },
  productTitle: {
    fontFamily: 'open-sans-regular',
    flex: 1,
    flexWrap: "wrap",
    paddingBottom: 6
    
  },
  productDescription: {
    padding: theme.SIZES.BASE / 2
  },
  imageHorizontal: {
    width: theme.SIZES.BASE * 6.25,
    margin: theme.SIZES.BASE / 2
  },
  imageStyle : {
    width: theme.SIZES.BASE * 6.25,
    height: theme.SIZES.BASE * 8.25 ,
    marginTop: -theme.SIZES.BASE,
    margin: theme.SIZES.BASE / 2,
    borderRadius: 3
  },
  options: {
    padding: theme.SIZES.BASE / 2
  },
  qty: {
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    width: theme.SIZES.BASE * 6.25,
    backgroundColor: argonTheme.COLORS.INPUT,
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: 10,
    borderRadius: 3,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 1
  },
  optionsButtonText: {
    fontFamily: 'open-sans-bold',
    fontSize: theme.SIZES.BASE * 0.75,
    color: theme.COLORS.WHITE,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: -0.29
  },
  optionsButton: {
    width: "auto",
    height: 34,
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: 10,
    borderRadius: 3,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 1
  },
  checkout: {
    height: theme.SIZES.BASE * 3,
    width: width - theme.SIZES.BASE * 4,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    shadowOpacity: 0.2
  },
  similarTitle: {
    lineHeight: 26,
    marginBottom: theme.SIZES.BASE,
    paddingHorizontal: theme.SIZES.BASE
  },
  productVertical: {
    height: theme.SIZES.BASE * 10.75,
    width: theme.SIZES.BASE * 8.125,
    overflow: "hidden",
    borderWidth: 0,
    borderRadius: 4,
    marginBottom: theme.SIZES.BASE,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: theme.SIZES.BASE / 4,
    shadowOpacity: 1
  }
});

export default Organisations;

