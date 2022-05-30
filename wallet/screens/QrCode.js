import React, { useState, useEffect } from 'react';
import { Block, Text, theme, Button } from "galio-framework";
import { View, StyleSheet, Dimensions, Modal, TouchableOpacity, Image } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import SqliteService from "../services/SqliteService"
import { argonTheme, Images } from "../constants";
import VcService from '../services/VcService';
const { width } = Dimensions.get("screen");
import Toast from 'react-native-toast-message';

export default function QrCode({navigation}) {

  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)
  const [did, setDid] = useState(null)
  const [privateKey, setPrivateKey] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [tab, settab] = useState([])
  const [vc, setvc] = useState(null)
  const db = SqliteService.openDatabase()
  
  const openModal = () => {
    setModalVisible(true)
  };

  const closeModal = () => {
    setModalVisible(false)
  };

  const getIdentity = async () => {
    await db.transaction((tx) => {
      tx.executeSql(
        `select * from identity`,
        [],(transaction, resultSet) => { 
          if(resultSet.rows.length != 0){
            setDid(resultSet.rows._array[0].did)
            setPrivateKey(resultSet.rows._array[0].privateKey)
          }
        },
        (transaction, error) => console.log(error)
      );
    });
  }

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    getIdentity()
    console.log("did from qr code",did);
  }, []);

  const setDID = (db, did) =>{
    db.transaction(
      (tx) => {
        tx.executeSql("update identity set did = ? where id = 1;", 
        [did],
        (tx, resultSet) => { console.log(resultSet)},
        (tx, error) => console.log(error)
        );
      }
    );
  }

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true)
    //alert(`${data}`)
    //console.log(data)
    if(did === null){
      setDID(db,data)
    }
    else{
      let res = await VcService.verifyVC(data,privateKey)
      //console.log("res  ",res);
      if(res.test){
        setvc(res.decrypted)
        let items = Object.keys(vc.credentialSubject)
        let tabs = []
        items.forEach(element => {
          if(element != "id")
            tabs.push({
              key : element,
              value : vc.credentialSubject[element]
            })
        });
        console.log("tabs",tabs);
        settab([...tabs])
        console.log("tab",tab);
        openModal()
      }
      else{
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: res.msg
        });
      }
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission ! </Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const decline = () => {
    closeModal()
    Toast.show({
      type: 'info',
      text1: 'Info',
      text2: "Credential Request Declined"
    });
  }
 
  const accept = async () => {
    let res = await VcService.signVC(vc,privateKey)
    db.transaction(tx => {
      tx.executeSql('INSERT INTO verifiableCredentials (vc_id, vc) values (?, ?)', 
      [res.id , JSON.stringify(res) ],
        (txObj, resultSet) => console.log("resultSet",resultSet.insertId),
        (txObj, error) => console.log('Error', error))
    }) 
    closeModal()
    navigation.navigate("Credentials") 
  }

  return (
    <>
      <View style={styles.container}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        {scanned && <Button onPress={() => setScanned(false)} size="small" 
        style={{width: width , margin:0, borderRadius: 0, backgroundColor: "#172B4D"}}>Tap to Scan Again</Button>}
      </View>
      { vc && tab ? <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={closeModal}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                        <Block style={styles.cardHeader}>                           
                            <Block row>
                                <Block style={styles.imageContainer}>
                                    <Image
                                        source={Images.logoEnsi}
                                        style={styles.imageModal}
                                        resizeMode= 'contain'
                                    />
                                </Block>
                                <Block row style={styles.rightSideModal}>
                                    <Block >
                                    <Text size={16} style={styles.productTitle} color={argonTheme.COLORS.WHITE}
                                        style={{fontWeight: "bold"}}>
                                        {vc.credentialSchema.id}
                                    </Text>
                                    <Text size={14} style={{marginVertical: 5}} color={argonTheme.COLORS.WHITE}>
                                        Ecole Nationale des Sciences de l'Informatique
                                    </Text>
                                    </Block>
                                </Block>
                            </Block>
                        </Block>
                        <Block style={{marginBottom: 20}}>
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
                </View>
                <View style={styles.bottom}>
                    <Text style={{ fontFamily: 'open-sans-regular',textAlign: 'center',marginBottom: 5 }} size={14} 
                    color={argonTheme.COLORS.BLACK}>
                        You have received a credential
                    </Text>
                    <Block row space="between" >
                        <Button color="secondary" onPress={decline}>
                            <Text style={{ fontFamily: 'open-sans-regular',textAlign: 'center' }} size={14} 
                            color={argonTheme.COLORS.BLACK}>Decline </Text>
                        </Button>
                        <Button color="success" onPress={accept}>
                            <Text style={{ fontFamily: 'open-sans-regular' }} size={16}
                            color={argonTheme.COLORS.WHITE}> Accept</Text>
                        </Button>
                    </Block>
                </View>
            </View>
      </Modal> : null }
        </>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
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
        marginVertical: 0
    },
    modalView: {
        backgroundColor: "white",
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
        borderWidth: 5
    },
    cardBody: {
        width: 320,
        backgroundColor: argonTheme.COLORS.WHITE,
        padding: 10
    },
    bottom: {
        backgroundColor: theme.COLORS.WHITE,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
        padding: 20
    }
})
