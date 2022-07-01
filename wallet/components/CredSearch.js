import React, { useEffect, useState } from "react";
import {
  Animated,
  FlatList,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image, Linking, Platform, Modal, RefreshControl
} from "react-native";
import { Block, Text, Input, theme } from "galio-framework";
import { environment } from '../constants/env';
const { width } = Dimensions.get("screen");
import { argonTheme, Images } from "../constants/";
import { Icon, Card, Select, Button } from "../components/";
import SqliteService from "../services/SqliteService"
import IssuerService from "../services/IssuerService";
import * as SQLite from 'expo-sqlite'

function CredSearch({navigation}){

  const [results, setresults] = useState([])
  const [search, setsearch] = useState("")
  const [active, setactive] = useState(false)
  const [vcList, setvcList] = useState([])
  const [credentialList, setcredentialList] = useState([])
  const [organisations, setOrganisations] = useState([])
  let animatedValue = new Animated.Value(0)
  const db = SqliteService.openDatabase()

  const retrieveIssuersList = async () => {
    let data = await IssuerService.getIssuerList()
    setOrganisations(data)
  }

  const getCredentials = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `select * from verifiableCredentials`,
        [],(transaction, resultSet) => setvcList(resultSet.rows._array),
        (transaction, error) => console.log(error)
      )
    })
    console.log("vcList",vcList);
    let credentials = []
    vcList.forEach((element) => {
      let vc = JSON.parse(element.vc)
      const result = organisations.filter(item => item.did === vc.issuer);
      console.log("result",result);
      vc = {...vc, issuerInfo : result[0]}
      credentials.push(vc)
    });
    setcredentialList(credentials)  
  }

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
      setRefreshing(true)
      retrieveIssuersList()
      getCredentials()
      setRefreshing(false)
    };

  useEffect(() => {
    retrieveIssuersList()
    getCredentials()
  }, [])

  const animate = () => { 
    animatedValue.setValue(0);

    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }

  const handleSearchChange = search => {
    const tab = credentialList.filter(
      item => search && item.credentialSchema.id.toLowerCase().includes(search)
    );
    setresults(tab)
    console.log("results",results);
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
        <Text style={{ fontFamily: 'open-sans-regular' }} size={16} color={argonTheme.COLORS.TEXT}>
          We didn’t find "<Text bold>{search}</Text>" in our system.
        </Text>
      </Block>
    );
  };

  const renderResults = () => {

    const [item, setitem] = useState(null)
    const [tab, settab] = useState([])
    const [modalVisible, setModalVisible] = useState(false);

    

    const opacity = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: "clamp"
    });
    
    const openModal = (item) => {
      setitem(item)
      let items = Object.keys(item.credentialSubject)
      let tabs = []
      items.forEach(element => {
        if(element != "id")
          tabs.push({
            key : element,
            value : item.credentialSubject[element]
          })
      });
      settab(tabs) 
      setModalVisible(true)
    };

    const closeModal = () => {
      setModalVisible(false)
    };
    
    return (
      <>
    
      {results.length === 0 && search ? (
        <Block style={{ width: width - 40 }}>
          {renderNotFound()}
        </Block>
      ) : (
        <Block flex center style={styles.cart}>  
          {results.map((result, index) =>{ return (
            <TouchableWithoutFeedback onPress={() => openModal(result)}>
              <Block card shadow style={styles.product} key={index} >
                      <Block row>
                        <Block style={{width: width*0.2, alignItems: 'center'}} >
                          <Image
                              source={{uri: `${environment.SERVER_API_URL}/image/` + result.issuerInfo.logo}}
                              style={styles.image}
                              resizeMode="contain"
                          />
                        </Block>
                        <Block style={styles.rightSide}>
                              <Text size={16} style={styles.productTitle} color={argonTheme.COLORS.BLACK}
                              style={{fontWeight: "bold"}}>
                                  {result.credentialSchema.id}
                              </Text>
                              <Text size={14} muted style={{marginVertical: 5}}>
                                  {result.issuerInfo.name}
                              </Text>
                        </Block>
                      </Block>
              </Block>
            </TouchableWithoutFeedback>
          )})}
        </Block>
      )}
  
      {item ? <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <TouchableOpacity style={styles.centeredView} onPress={closeModal}>
              <Block style={styles.modalView}>
                      <Block style={styles.cardHeader}>                           
                          <Block row>
                              <Block style={styles.imageContainer}>
                                  <Image
                                      source={{uri: `${environment.SERVER_API_URL}/image/` + item.issuerInfo.logo}}
                                      style={styles.imageModal}
                                      resizeMode= 'contain'
                                  />
                              </Block>
                              <Block row style={styles.rightSideModal}>
                                  <Block >
                                  <Text size={16} style={styles.productTitle} color={argonTheme.COLORS.WHITE}
                                      style={{fontWeight: "bold"}}>
                                      {item.credentialSchema.id}
                                  </Text>
                                  <Text size={14} style={{marginVertical: 5}} color={argonTheme.COLORS.WHITE}>
                                      {item.issuerInfo.name}
                                  </Text>
                                  </Block> 
                              </Block>
                          </Block>
                      </Block>
                      <Block>
                          {tab.map((item, index) => {  return (
                            <Block row space="between" style={styles.cardBody} key={index}>
                                <Block>
                                    <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.BLACK}>
                                    {item.key}
                                    </Text>
                                </Block>
                                <Block >
                                    <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.MUTED}>
                                    {item.value}
                                    </Text>
                                </Block>
                            </Block>
                          )})}
                      </Block>
              </Block>
          </TouchableOpacity>
        </Modal>: null }
    </>
    )
  };

  return (
      <Block flex center >
        <Block center style={styles.header}>
          {renderSearch()}
        </Block>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.cart}
        refreshControl={
          <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
          />
        } >
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
    marginVertical: theme.SIZES.BASE * 2,
    paddingLeft : 20
  },cart: {
        width: width,
        marginTop: 15
    },
    productTitle: {
      fontFamily: 'open-sans-bold',
      flex: 1,
      flexWrap: "wrap",
      paddingBottom: 6
    },
    product: {
        width: width * 0.90,
        borderWidth: 0,
        marginVertical: theme.SIZES.BASE / 2,
        marginHorizontal: theme.SIZES.BASE,
        backgroundColor: theme.COLORS.WHITE,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: theme.SIZES.BASE / 4,
        shadowOpacity: 0.1
    },
    rightSide : {
        width: width*0.8, 
        padding: 15,
        borderLeftColor: "#dadde1",
        borderStyle: "solid",
        borderLeftWidth: 1,
        height: 85
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 50,
        margin: 16,
        overflow: 'hidden'
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginTop: 22
    },
    modalView: {
        //margin: 20,
        backgroundColor: "white",
        //borderRadius: 20,
        //padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
        width: 0,
        height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    card: {
        width: 280
    },
    cardHeader: {
        width: 320,
        backgroundColor: argonTheme.COLORS.DEFAULT,
        marginBottom: 10,
        paddingBottom: 5
    },
    rightSideModal : {
        width: width*0.8, 
        padding: 15,
        height: 85
    },
    imageModal: {
        width: 50,
        height: 50,
        margin: 16
    },
    imageContainer: {
        width: width*0.2, 
        alignItems: 'center',
        height: 85,
        backgroundColor: argonTheme.COLORS.WHITE,
        borderColor: "#d7363c",
        borderStyle: "solid",
        borderWidth: 5,
    },
    cardBody: {
        width: 320,
        backgroundColor: argonTheme.COLORS.WHITE,
        padding: 10
    }
})

export default CredSearch;