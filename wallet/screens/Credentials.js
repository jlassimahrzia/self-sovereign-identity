
import { Block, Text, theme } from "galio-framework";
import {
    StyleSheet, Dimensions, Image, Modal, TouchableWithoutFeedback, TouchableOpacity,FlatList
} from "react-native";
import { argonTheme, Images } from "../constants";
import { Button } from "../components/";
import { AntDesign } from '@expo/vector-icons';
import { useEffect, useState } from "react";
const { width } = Dimensions.get("screen");
import SqliteService from "../services/SqliteService"
import IssuerService from "../services/IssuerService";
import { environment } from '../constants/env';
import * as SQLite from 'expo-sqlite';
function Credentials() {
    const [modalVisible, setModalVisible] = useState(false);
    const [vcList, setvcList] = useState([])
    const [credentialList, setcredentialList] = useState([])
    const [item, setitem] = useState(null)
    const [tab, settab] = useState([])
    const [organisations, setOrganisations] = useState([])
    

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
        settab([...tabs]) 
        setModalVisible(true)
    };

    const closeModal = () => {
        setModalVisible(false)
    };

    const getCredentials = async () => {
        const db = SqliteService.openDatabase()
        db.transaction((tx) => {
            tx.executeSql(
              `select * from verifiableCredentials`,
              [],(transaction, resultSet) => setvcList(resultSet.rows._array),
              (transaction, error) => console.log(error)
            );
        }); 
    }

    const retrieveIssuersList = async () => {
        let data = await IssuerService.getIssuerList()
        setOrganisations(data)
    }

    async function openDb() {
        return SQLite.openDatabase("wallet.db");
    }

    useEffect(() => {
        retrieveIssuersList()
        openDb().then(db =>{
            db.transaction((tx) => {
                tx.executeSql(
                  `select * from verifiableCredentials`,
                  [],(transaction, resultSet) => setvcList(resultSet.rows._array),
                  (transaction, error) => console.log(error)
                )
            })
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
        console.log("credentialList",credentialList);
    }, [])
    
    renderEmpty = () => {
        return <Text style={{ fontFamily: 'open-sans-regular' }} color={argonTheme.COLORS.ERROR}>The cart is empty</Text>;
    }

    return(
        <>
        <Block flex center style={styles.cart}>
        {credentialList ?
        <FlatList
            data={credentialList}
            renderItem={({item}) => (
                <Block>
                    <Block card shadow style={styles.product}>
                        <TouchableWithoutFeedback onPress={() => openModal(item)}>
                            <Block row>
                            <Block style={{width: width*0.2, alignItems: 'center'}} >
                                <Image
                                    source={{uri: `${environment.SERVER_API_URL}/image/` + item.issuerInfo.logo}}
                                    style={styles.image}
                                    resizeMode="contain"
                                />
                            </Block>
                            <Block style={styles.rightSide}>
                                <Text size={16} style={styles.productTitle} color={argonTheme.COLORS.BLACK}
                                    style={{fontWeight: "bold"}}>
                                    {item.credentialSchema.id}
                                </Text>
                                <Text size={14} muted style={{marginVertical: 5}}>
                                    {item.issuerInfo.name}
                                </Text>
                            </Block>
                            </Block>
                        </TouchableWithoutFeedback>
                    </Block>
                </Block>
            )}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => `${index}-${item.id}`}
            ListEmptyComponent={renderEmpty}
        /> : null} 
        </Block>
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
        </Modal> : null}
        </>
    )
}

const styles = StyleSheet.create({
    cart: {
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
export default Credentials;