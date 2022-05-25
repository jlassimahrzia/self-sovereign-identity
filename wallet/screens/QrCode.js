import React, { useState, useEffect } from 'react';
import { Block, Text, theme, Button } from "galio-framework";
import { View, StyleSheet, Dimensions, Modal, TouchableOpacity, Image } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import SqliteService from "../services/SqliteService"
import { argonTheme, Images } from "../constants";
const { width } = Dimensions.get("screen");

export default function QrCode() {

  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)
  const [did, setDid] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
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
            setDid(resultSet.rows._array[0].did)}
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

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true)
    //alert(`${data}`)
    //console.log(data)
    if(did === null){
      setDID(db,data)
    }
    else{
      console.log("VC", data)

    }
    SqliteService.getIdentity(db)
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission ! </Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
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
      <Modal
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
                                        Diplome
                                    </Text>
                                    <Text size={14} style={{marginVertical: 5}} color={argonTheme.COLORS.WHITE}>
                                        Ecole Nationale des Sciences de l'Informatique
                                    </Text>
                                    </Block>
                                </Block>
                            </Block>
                        </Block>
                        <Block style={{marginBottom: 20}}>
                            <Block row space="between" style={styles.cardBody}>
                                <Block>
                                    <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.TEXT}>Name</Text>
                                </Block>
                                <Block >
                                    <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.MUTED}>Jlassi Mahrzia</Text>
                                </Block>
                            </Block>
                            <Block row space="between" style={styles.cardBody}>
                                <Block>
                                    <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.TEXT}>Program Name</Text>
                                </Block>
                                <Block >
                                    <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.MUTED}>Computer Science Engineer</Text>
                                </Block>
                            </Block>
                            <Block row space="between" style={styles.cardBody}>
                                <Block>
                                    <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.TEXT}>Graduation Year</Text>
                                </Block>
                                <Block >
                                    <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.MUTED}>2022</Text>
                                </Block>
                            </Block>
                            <Block row space="between" style={styles.cardBody}>
                                <Block>
                                    <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.TEXT}>Final Grades</Text>
                                </Block>
                                <Block >
                                    <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.MUTED}>B+</Text>
                                </Block>
                            </Block>
                        </Block>
                </View>
                <View style={styles.bottom}>
                    <Text style={{ fontFamily: 'open-sans-regular',textAlign: 'center',marginBottom: 5 }} size={14} 
                    color={argonTheme.COLORS.BLACK}>
                        You have received a credential
                    </Text>
                    <Block row space="between" >
                        <Button color="secondary">
                            <Text style={{ fontFamily: 'open-sans-regular',textAlign: 'center' }} size={14} 
                            color={argonTheme.COLORS.BLACK}>Decline </Text>
                        </Button>
                        <Button color="success">
                            <Text style={{ fontFamily: 'open-sans-regular' }} size={16}
                            color={argonTheme.COLORS.WHITE}> Accept</Text>
                        </Button>
                    </Block>
                </View>
            </View>
        </Modal>
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
