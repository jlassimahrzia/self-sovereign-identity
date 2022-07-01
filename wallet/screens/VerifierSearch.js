import React, { useEffect, useState } from "react";
import {
  Animated,
  FlatList,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image, Linking, Platform
} from "react-native";
import { Block, Text, Input, theme } from "galio-framework";
import { environment } from '../constants/env';
const { width } = Dimensions.get("screen");
import ViewMoreText from 'react-native-view-more-text';
import { argonTheme, Images } from "../constants/";
import { Icon, Card, Select, Button } from "../components/";

import VerifierService from "../services/VerifierService";
function VerifierSearch({navigation}){

  const [results, setresults] = useState([])
  const [search, setsearch] = useState("")
  const [active, setactive] = useState(false)
  const [verifiers, setVerifiers] = useState([])

  const retrieveVerifiersList = async () => {
    let data = await VerifierService.getVerifierList()
    setVerifiers(data)
  }
   
  useEffect(() => {
    retrieveVerifiersList();
  }, [])

  let animatedValue = new Animated.Value(0);
  const animate = () => {
    
    animatedValue.setValue(0);

    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }

  const handleSearchChange = search => {
    const results = verifiers.filter(
      item => search && item.name.toLowerCase().includes(search)
    );
    setresults(results)
    setsearch(search)
    animate()
  };

  const renderSearch = () => {
    const iconSearch = search ? (
      <TouchableWithoutFeedback onPress={() => setsearch("")}>
        <Icon
          size={16}
          color={theme.COLORS.MUTED}
          name="magnifying-glass"
          family="entypo"
        />
      </TouchableWithoutFeedback>
    ) : (
      <Icon
        size={16}
        color={theme.COLORS.MUTED}
        name="magnifying-glass"
        family="entypo"
      />
    );

    return (
      <Input
        right
        color="black"
        autoFocus={true}
        autoCorrect={false}
        autoCapitalize="none"
        iconContent={iconSearch}
        defaultValue={search}
        style={[styles.search, active ? styles.shadow : null]}
        placeholder="Search"
        onFocus={() => setactive(true)}
        onBlur={() => setactive(false)}
        onChangeText={handleSearchChange}
      />
    );
  };

  const renderNotFound = () => {
    return (
      <Block style={styles.notfound}>
        <Text style={{ fontFamily: 'open-sans-regular' }} size={18} color={argonTheme.COLORS.TEXT}>
          We didn’t find "<Text bold>{search}</Text>" in our system.
        </Text>
      </Block>
    );
  };

  const renderResult = result => {

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

    const opacity = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: "clamp"
    });

    return (
      <Animated.View
        key={`result-${result.name}`}
      >
              <Block>
                <Block card shadow style={styles.product}>
                    <Block flex row>
                        <TouchableWithoutFeedback
                          onPress={() => navigation.navigate("Credentials", { org : result})}
                        > 
                        <Block style={styles.imageHorizontal}>
                            <Image
                            source={{uri: `${environment.SERVER_API_URL}/image/` + result.logo}}
                            style={styles.imageStyle}
                            resizeMode="contain"
                            />
                        </Block>
                        </TouchableWithoutFeedback>
                        <Block flex style={styles.productDescription}>

                          <Block
                            middle
                            row
                            space="evenly"
                          >
                          <TouchableWithoutFeedback
                            onPress={() => navigation.navigate("Credentials", { org : result})}
                          >
                            <Text size={14} style={styles.productTitle} color={argonTheme.COLORS.PRIMARY}
                            style={{fontWeight: "bold",margin: 5}}>
                              {result.name}
                            </Text>
                          </TouchableWithoutFeedback>
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
                              onPress={() => openEmail(result.email)}
                            >
                              Email
                            </Button>
                            <Button
                              small
                              style={{ backgroundColor: argonTheme.COLORS.DEFAULT }}
                              icon="link" iconFamily="antdesign" iconSize={13} iconColor="#fff"
                              onPress={() => openUrl(result.website)}
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
                              onPress={() => openMap(result.location)}
                            >
                              Address
                            </Button>
                            <Button
                              small
                              style={{ backgroundColor: argonTheme.COLORS.DEFAULT }}
                              icon="mobile1" iconFamily="antdesign" iconSize={13} iconColor="#fff"
                              onPress={() => openTel(result.phone)}
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
                              <Text size={14} style={styles.productTitle} style={{color:argonTheme.COLORS.BLACK,margin: 3, textAlign: "justify"}}>
                                {result.description}
                              </Text>
                            </ViewMoreText>
                    </Block>
                </Block>
              </Block>
      </Animated.View>
    );
  };

  const renderResults = () => {
    if (results.length === 0 && search) {
      return (
        <Block style={{ width: width - 40 }}>
          {renderNotFound()}
        </Block>
      );
    }

    return (
      <Block style={{ paddingTop: theme.SIZES.BASE * 2 }}>
        {results.map(result => renderResult(result))}
      </Block>
    );
  };

  return (
      <Block flex center >
        <Block center style={styles.header}>
          {renderSearch()}
        </Block>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.cart}>
          {renderResults()}
        </ScrollView>
      </Block>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    width: width,
    paddingHorizontal: theme.SIZES.BASE
  },
  search: {
    height: 48,
    width: width - 32,
    marginHorizontal: theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE,
    borderWidth: 1,
    borderRadius: 3
  },
  shadow: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2
  },
  header: {
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 2,
    zIndex: 2
  },
  notfound: {
    marginVertical: theme.SIZES.BASE * 2
  },
  suggestion: {
    height: theme.SIZES.BASE * 1.5,
    marginBottom: theme.SIZES.BASE
  },
  result: {
    backgroundColor: theme.COLORS.WHITE,
    marginBottom: theme.SIZES.BASE,
    borderWidth: 0
  },
  resultTitle: {
    flex: 1,
    flexWrap: "wrap",
    paddingBottom: 6
  },
  resultDescription: {
    padding: theme.SIZES.BASE / 2
  },
  image: {
    overflow: "hidden",
    borderBottomLeftRadius: 4,
    borderTopLeftRadius: 4
  },
  dealsContainer: {
    justifyContent: "center",
    paddingTop: theme.SIZES.BASE
  },
  deals: {
    backgroundColor: theme.COLORS.WHITE,
    marginBottom: theme.SIZES.BASE,
    borderWidth: 0
  },
  dealsTitle: {
    flex: 1,
    flexWrap: "wrap",
    paddingBottom: 6
  },
  dealsDescription: {
    padding: theme.SIZES.BASE / 2
  },
  imageHorizontal: {
    overflow: "hidden",
    borderBottomLeftRadius: 4,
    borderTopLeftRadius: 4
  },
  imageVertical: {
    overflow: "hidden",
    borderTopRightRadius: 4,
    borderTopLeftRadius: 4
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
  cart: {
    width: width
  },
  imageStyle : {
    width: theme.SIZES.BASE * 6.25,
    height: theme.SIZES.BASE * 8.25 ,
    //marginTop: -theme.SIZES.BASE,
    margin: theme.SIZES.BASE / 2,
    borderRadius: 3
  },
})

export default VerifierSearch;