import React, { useState, useEffect, Fragment } from 'react';
import { Block, Text, theme, Button } from "galio-framework";
import { View, StyleSheet, Dimensions, Modal, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import SqliteService from "../services/SqliteService"
import { argonTheme, Images } from "../constants";
import VcService from '../services/VcService';
import VerifierService from '../services/VerifierService';
import IssuerService from '../services/IssuerService';
const { width } = Dimensions.get("screen");
import Toast from 'react-native-toast-message';
import { AntDesign } from '@expo/vector-icons';
import ViewMoreText from 'react-native-view-more-text';
export default function QrCode({navigation}) {

  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)
  const [did, setDid] = useState(null)
  const [privateKey, setPrivateKey] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [tab, settab] = useState([])
  const [vc, setvc] = useState(null)
  const [id, setid] = useState("")
  const [vcList, setvcList] = useState([])
  const [verifiable_presentation , setVerifiablePresentation] = useState({})
  const [modalVpVisible, setModalVpVisible] = useState(false)

  const [issuers, setIssuers] = useState([])

  const retrieveIssuersList = async () => {
      let data = await IssuerService.getIssuerList()
      let issuerList = []
      data.forEach(element => {
        issuerList.push({
            value : element.did , label : element.name
        })
      });
      setIssuers(issuerList)
    }
  const db = SqliteService.openDatabase()
  
  const openModal = () => {
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
  
  function getIssuer(didIssuer) {
    
    let data = issuers.filter(issuer => issuer.value === didIssuer)

    return data[0].label
    }


  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    getIdentity()
    getCredentials()
    retrieveIssuersList();
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

  const verif = (db, id) =>{
    db.transaction(
      (tx) => {
        tx.executeSql("select * from verifiableCredentials where vc_id = ? ", 
        [id],
        (tx, resultSet) => console.log("resultSet",resultSet),
        (tx, error) => console.log(error)
        );
      }
    );
  }

  const createVerifiablePresentation = async (vp , data) => {
    let verifiablePresentation = {
      '@context' : ["https://www.w3.org/2018/credentials/v1"],
      type : ["VerifiablePresentation", vp.title],
      title : vp.title,
      description: vp.description,
      holder : did,
      verifier : data.verifier,
      issuanceDate : (new Date(Date.now())).toISOString(),
      vpSchema: {
        "id": vp.title,
        "type": "JsonSchemaValidator2018"
      },
      verifierProof: data.verifierSignature,
      verifiableCredential : [],
      holderProof : {}
    }

    let tab = []
    vp.properties.verifiableCredential.items.forEach(element => {
      let result = vcList.filter(vc => (JSON.parse(vc.vc).credentialSchema.id === element.title && JSON.parse(vc.vc).issuer === element.issuer));
      tab.push(result[0])
    });

    tab.forEach((element, index) => {
      let credential = JSON.parse(element.vc)
      let item = {
        '@context': credential['@context'],
        id: credential.id,
        type: credential.type,
        issuer: credential.issuer,
        issuanceDate: credential.issuanceDate,
        credentialSubject: {},
        credentialSchema: credential.credentialSchema,
        issuerProof : credential.issuerProof,
        holderProof : credential.holderProof
      }
      
      let k = {}
      Object.keys(vp.properties.verifiableCredential.items[index].properties.credentialSubject.properties).map(function (key, index) {
        k = {
            ... k,
            [key]: credential.credentialSubject[key]
        }
      });

      item.credentialSubject = k

      verifiablePresentation.verifiableCredential.push(item)
    });

    //let finalres = await VcService.signVC(verifiablePresentation,privateKey)
    
    //console.log("finalres",finalres);

    return verifiablePresentation

  }

  const openModalVp = async (item) => {
    setModalVpVisible(true) 
  };

  const closeModalVp = () => {
      setModalVpVisible(false)
      setVerifiablePresentation({})
  };

  
  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true)
    data = JSON.parse(data)
    if(did === null){
      setDID(db,data)
    }
    if(data.type === "vc"){
      let res = await VcService.verifyVC(data.encrypted,privateKey)
      if(res.test){
        setvc(res.decrypted)
        let items = Object.keys(res.decrypted.credentialSubject)
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
    if(data.type === "vp"){
      let res = await VerifierService.verifyVerificationTemplate(data.encrypted,privateKey)
      if(res.test){
        let finaleRes = await createVerifiablePresentation(JSON.parse(res.verificationTemplate), res.decrypted);
        setVerifiablePresentation(finaleRes)
        openModalVp()
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
 
  const declineVP = () => {
    closeModalVp()
    Toast.show({
      type: 'info',
      text1: 'Info',
      text2: "Verification Request Declined"
    });
    setVerifiablePresentation({})
  }

  const acceptVP = async () => {
    let res = await VcService.signVC(verifiable_presentation,privateKey)
    console.log(res);
    navigation.navigate("Home") 
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

  const decline = () => {
    closeModal()
    Toast.show({
      type: 'info',
      text1: 'Info',
      text2: "Credential Request Declined"
    });
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

        { verifiable_presentation && 
            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVpVisible}
            >
            <ScrollView style={styles.centeredView}>
                <View style={styles.modalView}>
                    {/** Start */}
                    <Block style={styles.card}>
                        <Block row>
                            <Block style={{width : width*0.7}}>
                                <Text
                                size={16}
                                style={{ fontFamily: "open-sans-bold" }}
                                color={argonTheme.COLORS.TEXT}
                                >
                                    Proof Request : {verifiable_presentation.title}
                                </Text>
                            </Block>
                            <Block style={{width : width*0.2}}>
                                <AntDesign name="closesquareo" size={24} color={argonTheme.COLORS.PRIMARY} 
                                onPress={closeModal}/>
                            </Block>
                        </Block>
                        <Block style={styles.cardHeader} style={{marginTop : 20}}>
                            <ViewMoreText
                              numberOfLines={2}
                              renderViewMore={renderViewMore}
                              renderViewLess={renderViewLess}
                            >
                                <Text
                                    color={argonTheme.COLORS.BLACK}
                                    size={14}
                                    style={{ fontFamily: "open-sans-regular"}}
                                >
                                    {verifiable_presentation.description}
                                </Text>
                            </ViewMoreText>
                        </Block>
                        <Block middle style={styles.cardHeader} style={{marginTop : 20}}>
                                <Text
                                    color={argonTheme.COLORS.BLACK}
                                    size={14}
                                    style={{ fontFamily: "open-sans-regular"}}
                                    middle
                                >
                                    This organization is requesting the  
                                </Text>
                                <Text
                                    color={argonTheme.COLORS.BLACK}
                                    size={14}
                                    style={{ fontFamily: "open-sans-regular"}}
                                    middle
                                >
                                    following informations : 
                                </Text>
                        </Block>
                        <Block middle style={styles.cardHeader} style={{margin : 15}}>
                                <Text
                                    color={argonTheme.COLORS.BLACK}
                                    size={15}
                                    style={{ fontFamily: "open-sans-regular", fontWeight: "bold"}}
                                    middle
                                >
                                    {verifiable_presentation?.verifiableCredential?.length} Credential(s) Included
                                </Text>
                        </Block>
                        
                        {  verifiable_presentation.verifiableCredential ? 
                            (verifiable_presentation.verifiableCredential.map((item, index) => {
                              return ( 
                                <Fragment key={index}>
                            <Block style={{backgroundColor: "white"}}>
                                <Block style={{ backgroundColor: "#d7363c",padding: 10}}>    
                                    <Block>  
                                        <Text size={14} color={argonTheme.COLORS.WHITE} style={{fontWeight: "bold"}}>
                                            Credential {index +1} :  {item.credentialSchema.id}
                                        </Text>
                                    </Block>  
                                    <Block>  
                                        <Text size={14} style={{fontWeight: "bold"}} color={argonTheme.COLORS.WHITE}>
                                            Issuer : {getIssuer(item.issuer)}
                                        </Text>
                                    </Block>
                                </Block>
                            </Block>
                            <Block style={{backgroundColor: "white", marginBottom: 10}}>
                                <Block style={{ borderColor: "#d7363c",
        borderStyle: "solid",
        borderWidth: 5,padding: 10}}>  
                                {  item.credentialSubject ? 
                                    ( Object.entries(item.credentialSubject).map((element, index) => {                                      
                                        return (
                                        <Block  space="between" key={index}>
                                            <Block>
                                                <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.BLACK}>
                                                {element[0]}
                                                </Text>
                                            </Block>
                                            <Block >
                                                <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.MUTED}>
                                                {element[1]}
                                                </Text>
                                            </Block>
                                        </Block>    
                                        );
                                    }))
                                : null} 
                                </Block>
                            </Block>
                            </Fragment>
                             );
                            }))
                        : null}
                    </Block>
                    {/** End */}
                </View>
                <View style={styles.bottom}>
                    <Text style={{ fontFamily: 'open-sans-regular',textAlign: 'center',marginBottom: 5 }} size={14} 
                    color={argonTheme.COLORS.BLACK}>
                        You have received a credential
                    </Text>
                    <Block row space="between" >
                        <Button color="secondary" onPress={declineVP}>
                            <Text style={{ fontFamily: 'open-sans-regular',textAlign: 'center' }} size={14} 
                            color={argonTheme.COLORS.BLACK}>Decline </Text>
                        </Button>
                        <Button color="success" onPress={acceptVP}>
                            <Text style={{ fontFamily: 'open-sans-regular' }} size={16}
                            color={argonTheme.COLORS.WHITE}> Accept</Text>
                        </Button>
                    </Block>
                </View>
            </ScrollView>
            </Modal> } 
      
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
        //justifyContent: "center",
        //alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        //borderRadius: 20,
        padding: 20,
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
        borderWidth: 5
    },
    cardBody: {
        width: 320,
        backgroundColor: argonTheme.COLORS.WHITE,
        padding: 10
    },
    bottom: {
        backgroundColor: theme.COLORS.WHITE,
        //position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
        padding: 20
    }
})
