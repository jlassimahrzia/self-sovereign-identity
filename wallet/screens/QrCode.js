import React, { useState, useEffect, Fragment } from 'react';
import { Block, Text, theme, Button } from "galio-framework";
import { View, StyleSheet, Dimensions, Modal, TouchableOpacity, Image, Alert, RefreshControl
, ScrollView, SafeAreaView } from 'react-native';
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
const db = SqliteService.openDatabase()
import { environment } from '../constants/env';
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
  const [idRequest, setidRequest] = useState()

  const [issuers, setIssuers] = useState([])

  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
      setRefreshing(true);
      await (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
      await retrieveIssuersList();
      getIdentity();
      getCredentials();
      setRefreshing(false);
  };

  const retrieveIssuersList = async () => {
      let data = await IssuerService.getIssuerList()
      setIssuers(data)
  }

  const getIssuer = (didIssuer) => {
    
    let data = issuers.filter(issuer => issuer.did === didIssuer)
console.log( "gggggg",data[0]);
    return data[0]
  }
  
  
  const openModal = () => {
    setModalVisible(true)
  };

  const closeModal = () => {
    setModalVisible(false)
  };

  const getCredentials = () => {
    db.transaction((tx) => {
        tx.executeSql(
          `select * from verifiableCredentials`,
          [],(transaction, resultSet) => setvcList(resultSet.rows._array),
          (transaction, error) => console.log(error)
        );
    }); 
    console.log(vcList);
  }

  const getIdentity = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `select * from identity`,
        [],(transaction, resultSet) => { 
          if(resultSet.rows.length !== 0){
            setDid(resultSet.rows._array[0].did)
            setPrivateKey(resultSet.rows._array[0].privateKey)
          }
        },
        (transaction, error) => console.log(error)
      );
    });

    console.log(did);
  }
  

  useEffect(() => {
    
    getIdentity()
    getCredentials()
    retrieveIssuersList();
    
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
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
    /* data = {
      encrypted: '0333eec583d04a55ce0aba9dbfb04035e8c6de4f501ecc9b26c08fa501a5ec1507e05518776f305c3e664d119522483884d80b4fec3ff4fbadc546e3a37fe189d35220eaeb1715fe4d4170b06a6d1494768442235be8e9584537bec968c37e93dbb577db4ec085b400631f93ac0b8daab8df77ac7a1cedbe516557d9bacaa1cae6cfd8a04ecf2b92b8dc4fd9da03fe7d53d55e6e724f6cc38018c3f387bca40a9a9018db3af12fec90b964a128e096151907d6b1beed4e22464d6396b99e7037a2dbb13502f7bcd1d74e7b2c979150c8296df422b7e5ec6aef9121a2bb1c952646b29900e19e3dce9247a92e839e4fd006ebd7e3fd27017ba4cd36d504a113f77c3b128d5c1af0ca36eeb5638a5fb0097a9820511d63be9d0bdb31a42f08a4d9f3fb4e5a41b913a45daf610a6c1b4b8f2c276981c483517517e34b883440a2cbc72f93340e96f604bd2dd4da079854e7081e0ab7a7d32fe1d5f03b459059e500d9799fda06be31820e9d339f80e77e5be4e5775d0b2abe17048254d6f1b39d9ce7b70debfd892fddbf1de45d0ef27d9370a2e0f4876d312964b4416ac934f3c6a38d966d3e0f80e9f61ccd1fdc8f3e6f8d2533549732c68a548fae227b9663bf71c37a96dbb50191ab4148c35be8baae7bc017391359fc13ccb9510c216ddf40f3bc7d1eb6dcaa1bf5312a2f8a245396214fa5a4ec71f972e04070a25d15b37e1f950554539490b4684f893a100de216c443655f7f3b528fe4820c8a0445e8e6790a09be39ed9f4c27527662fee0ed169d3d3a1b6e83b179a1be200cebe4aba97abbd183919270fe1b829c2edb67112abd7cb55815091ff03f1caf5ec696be2bb109d1e411f845030a91f28342cf2be16fd69b6b858599c41d5f952e1aab19c4de4830b646a8cdaf43ffe18de7b7ec48b94b8a3b1c69c7bf2c0995faaafa75eb13c280b02c7f1ee5c94aea235f71c4eaf3d061df1f308afa518fb8be4465ea4e482854b6c512a8304129c23475648a4cea0bc11963ff483866dacd22baaa44a48b4b0815521b9b7db2f8792aa2b5a8eb2cc8a6abbc92b9937351df9d60f8f98a987845167cdd0b915527a06d1b8f9bc5a90bbd64970dc63242ca930a0208389b3d1fd6a33f2238e265931ad5d2df4322aba6997f6be83617a10f3042ae312e62143b6581c51a52acdacf87f01cb5cc6756cfc5f5477b889fa90f1179cfd66bd06b7329acbff1c51c9ced6e641c2c62f3b362705c2903c3be08afd1f0db73926fcbfed2b8041b7e10f789c32871bc74c9e0db10f747b75833b83933cb757c06688b1978f2c98207f13eae7e18d7d896f3fb760b337273b65895808d1829dfd226cc3713ffe4d668b3ce9b3e72d309cf05472ef67f1cd22082dab590933c5e6bda3332746b3a5308cd31745c1c17976ad0d1ca49381b30e25249cf8231e19b0ee32b7f6e866d2b9238df3977f28ee7e8e302',
      type: 'vc'
    } */
    /* data = { 
      encrypted: '0333eec583d04a55ce0aba9dbfb04035e8c6de4f501ecc9b26c08fa501a5ec1507913b179a5e2dcdb794af81ef6d63e394f25a8efbdda98476ca1f3f5012f8e9224eba0af46420b9da66ab390eddf7df0ad6c867c5b7a5c3d0260be290b1b39befefa5250951ef78920cd510579911c46d91b700b887f8ff62d3dd9bad040ac39aad88d7c04c2307413ab521aabfce3ca560924fc1a9d53b51984d81df9de4fd386e217cda238ad8a36973fa456d45e4294a48ac19b4acf1f4e7539ed65891f9fa86b8b8952648bbb423427e973d3c665d0c0a1a17914c6f783e99d4ace2bac393873c68b78c5abe5c219fc7f6893d089ed3fb713377cd1efd7fe8e785dafe4219499a8069aa7630e6b42bcd58430fec33f56d69a3610750a742e90799c3e8abf9ff071b0e53016a53de3c48e3f3c2c1b0e6a77deb4f92c6c73b3591ea2a31a3a575d74917646ed985c5e5247122eb9a41398232790ce02f841ce2c1765396538c2c658287ab4c6bf4a41f1677478f9c949e7998dda316e091cf8b5d3de29f6c1d976e703abb937fbe0702029d66ef8ecb4776f0aeee1001d62aedd2bde76ca37a9c02d2f949455728ad26e37e903344acfa70374a004033bbb58bd7162d8e0db9a3f0d9d047cfebf5b43e994c48e291634dce6938eda1d95bae37a7890d1af0eba414a7cf6b4e307bd9d20ac0203245956fbfb4207d8f5ba76af4414441bd8f1260b9c9066b1adf5b74181592612440cae59bd9f8576378f37cbee3d3dcb906f77888980c73902cd075ad10fe41ee61efb83e36398d231874fce9f702518aa81a6f1775607a3f33c3a50fc73e2093da06460c2f10d29867c9eb73ed3a28327d00d90a22828f5b329da8a4b4f42f5016afe6398385f3ae00a1f80786af41aa921bc31d824eef822857fa21d915ae34f723de0019e4a62e008a76e57045dc8fe80adac8f36a40d8d730ab819bcecb4b4acc300a3a6fa7850c4a3131f76ad87d17acd7166de3f30469110c4351b55dbadc74099115f985264ff57032592eb802997c027e6a90a6b3aa3f0adfb1ae654d635a5705dcabea7323b6e3562c64df7928890a39a73d8d6e2f50757e08e1302b1a25e8dcce1a6c2d244453b1e20d182da4df931c4f08261661919164ac0b791932d8600dcff4084cb2e3ae3890d017cc918b311bc5a2c5a3a5cbb200b3d64f8bd7cea122ead319d20999d488a8cb561040622094b324b560717eea5b0d2287b1576c1e92262aa4c0f348e72c757c0fdda62be928950a4cb5ac710ae58cb35172b218103d05bfbcf5afa339d532785a1835f16c191cda3323a2c4d19109e6b6623dfff09c6c4f17c4bca3a16bc55e3bea485721935b425ae3155cbfe54e180fad3cfb5e08e8c614daa17e005aed901c2f50db1a178db23c16fddf2036af9c9bda7b59b4e77fcc2919fc6765c089a04ce36854270a8725cce6831aac3ef5d4e71e56bc32dd0fe93591e20c0d39a56ad3614dffa53b9dcf861c1664b865abd1b82030670700d0a8b935784534217318e4b47e21de3275a10630f8a2813ccbfc91b3b78c821252e07e8609c711f6f443833aa52aace7a8b4e124bd590ca812cb45e562aeee30f13ef9c71efc9fd3caada6d2197aca68e1782be5e13c9e1266f260ab6141dcec960768ea1e670bb2f4bfca3b7684a3f1c213a230a24fbb330060335ae08a',
  type: 'vc'} */
    data = JSON.parse(data)
    console.log(data);
    if(did === null){
      setDID(db,data)
    }
    else if(data.type === "vc"){
      let res = await VcService.verifyVC(data.encrypted,privateKey)
      console.log(res);
      if(res.test){
        setvc(res.decrypted)
        console.log(vc);
        let items = Object.keys(res.decrypted.credentialSubject)
        let tabs = []
        items.forEach(element => {
          if(element != "id")
            tabs.push({
              key : element,
              value : res.decrypted.credentialSubject[element]
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
    else if(data.type === "vp"){
      let res = await VerifierService.verifyVerificationTemplate(data.encrypted,privateKey)
      if(res.test){
        let finaleRes = await createVerifiablePresentation(JSON.parse(res.verificationTemplate), res.decrypted);
        setVerifiablePresentation(finaleRes)
        setidRequest(res.decrypted.id_request)
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
    let data = {
        verifiablePresentation : res, 
        did_holder : did, 
        did_verifier : verifiable_presentation.verifier,
        idRequest : idRequest
    }
    let done = await VerifierService.generateVerificationResponse(data)
    closeModalVp()
    Toast.show({
        type: 'success',
        text1: 'Success',
        text2: "Documents sended successfully"
    });
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
    Toast.show({
        type: 'success',
        text1: 'Success',
        text2: "Credential Added Successfully"
    });
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

    <SafeAreaView>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <Text center size={14} style={{marginTop: 5}}>Scan the QR Code to get your DID, Credentials and Requests. </Text>
      </ScrollView>
    </SafeAreaView>
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
                                        source={{uri: `${environment.SERVER_API_URL}/image/` + getIssuer(vc.issuer)?.logo}}
                                        style={styles.imageModal}
                                        resizeMode= 'contain'
                                    />
                                </Block>
                                <Block row style={styles.rightSideModal}>
                                    <Block >
                                    <Text size={16}color={argonTheme.COLORS.WHITE}
                                        style={{fontWeight: "bold"}}>
                                        {vc.credentialSchema.id}
                                    </Text>
                                    <Text size={14}  color={argonTheme.COLORS.WHITE}>
                                      {getIssuer(vc.issuer)?.name}  
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
                <View style={styles.bottom2}>
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
                                            Issuer : {getIssuer(item.issuer).name}
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
                        You have received a Verification Request
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
    },
    bottom2: {
      backgroundColor: theme.COLORS.WHITE,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 120,
      padding: 20
  }
})