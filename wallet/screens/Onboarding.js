import {React, useEffect, useState} from 'react'
import {
  ImageBackground,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity, Modal, TextInput
} from "react-native";
import { Block, Button, Text, theme} from "galio-framework";
const { height, width } = Dimensions.get("screen");
import argonTheme from "../constants/Theme";
import Images from "../constants/Images";
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import SqliteService from "../services/SqliteService"
import DidService from '../services/DidService';
import Toast from 'react-native-toast-message';
import * as SQLite from 'expo-sqlite';  
import CryptoES from "crypto-es";
import { BarCodeScanner } from 'expo-barcode-scanner';
import BackupService from '../services/BackupService';


function Onboarding({ navigation }) {

    const db = SqliteService.openDatabase()

    const [id, setId] = useState(null)
    const [load, setLoading] = useState(false)
    
    const [phrase, setphrase] = useState("")

    const [fragmentsList, setfragmentsList] = useState([])

    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisible1, setModalVisible1] = useState(false);
    const [modalVisible2, setModalVisible2] = useState(false);
    const [modalVisible3, setModalVisible3] = useState(false);

    const [hasPermission, setHasPermission] = useState(null)
    const [scanned, setScanned] = useState(false)

    const scan = () => {
      (async () => {
          const { status } = await BarCodeScanner.requestPermissionsAsync();
          setHasPermission(status === 'granted');
          openModal3()
      })();
      
    }

    const addFragment = async (fragment) =>{
      await db.transaction(
        (tx) => {
          tx.executeSql("insert into Fragments (fragment) values (?)", 
          [JSON.stringify(fragment)],
          (tx, resultSet) => { 
              return resultSet.insertId 
          },
          (tx, error) => console.log(error)
          );
        }
      );
    }
    
    const getFragments = async () => {
      await db.transaction((tx) => {
        tx.executeSql(
          `select * from Fragments`,
          [],(transaction, resultSet) => setfragmentsList(resultSet.rows._array),
          (transaction, error) => console.log(error)
        );
      });
    }

    const handleBarCodeScanned = async ({ type, data }) => {
      setScanned(true);
      data = JSON.parse(data)
      console.log(data);
      let id 
      if( typeof data !== String)
        id = addFragment(data)
      
      if(id){
          Toast.show({
              type: 'info',
              text1: 'Success',
              text2: "Fragment added successfully"
          });
          closeModal3()
          getFragments()
      }
      else{
          Toast.show({
              type: 'error',
              text1: 'Error',
              text2: "Something went wrong, try again!"
          });
      }
      
    };

    const recoverKey = async () => {
      let result = await BackupService.recoverKey(fragmentsList)
      console.log(result);
      if(result.test){
        await recoverIdentity(result.identity)
        db.transaction(tx => {
          tx.executeSql('INSERT INTO profile (firstname, lastname, email) values (?,?,?)', 
          [result.profile.firstname, result.profile.lastname, result.profile.email],
            (txObj, resultSet) => setId(resultSet.insertId),
            (txObj, error) => console.log('Error', error))
        })
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: "Identity recovered successfully"
        });
        navigation.navigate('App');
      }
      else{
        closeModal2()
        closeModal()
        
        Toast.show({
          type: 'info',
          text1: 'Failed',
          text2: result.msg
        });
      } 
    }

    useEffect(() => {
      getFragments()
      console.log(fragmentsList);
    }, [])
    

    const openModal2 = () => {
      setModalVisible2(true)
    };

    const closeModal2 = () => {
        setModalVisible2(false)
    };

    const openModal1 = () => {
      setModalVisible1(true)
    };

    const closeModal1 = () => {
        setModalVisible1(false)
    };

    const openModal = () => {
      setModalVisible(true)
    };

    const closeModal = () => {
        setModalVisible(false)
    };

    const openModal3 = () => {
      setModalVisible3(true)
    };

    const closeModal3 = () => {
        setModalVisible3(false)
    };

    const iv = CryptoES.enc.Utf8.parse("ABCDEF1234123413");

    function Decrypt(word, key) {
      const encryptedHexStr = CryptoES.enc.Hex.parse(word);
      const srcs = CryptoES.enc.Base64.stringify(encryptedHexStr);
      console.log(key);
      const decrypt = CryptoES.AES.decrypt(srcs, CryptoES.enc.Utf8.parse(key), {
          iv,
          mode: CryptoES.mode.CBC,
          padding: CryptoES.pad.Pkcs7
      });
      //console.log(decrypt);
      const decryptedStr = decrypt.toString(CryptoES.enc.Utf8);
      //console.log(decryptedStr);
      return decryptedStr.toString();
    }


    const importDB2 = async () => {
      const result = await DocumentPicker.getDocumentAsync();
      console.log(phrase);
      let content = await FileSystem.readAsStringAsync(result.uri, {encoding: FileSystem.EncodingType.Base64}).then(async res => {
          let decryptedRes = Decrypt(res, phrase);
          console.log(decryptedRes);
          await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + 'SQLite/wallet.db', decryptedRes, {encoding: FileSystem.EncodingType.Base64}).then(async () => {
             let db = SQLite.openDatabase(FileSystem.documentDirectory + 'SQLite/wallet.db');
             console.log("done");
             closeModal1()
             setphrase("")
             navigation.navigate('App');
             
          });
               
      });

      

    }


    const showToast = () => {
      Toast.show({
        type: 'error',
        text1: 'Hello',
        text2: 'This is some something 👋'
      });
    }

    const addIdentity = (db, keyPair) =>{
      db.transaction(
        (tx) => {
          tx.executeSql("insert into identity (address, privateKey,publicKey) values (?,?,?)", 
          [keyPair.address,keyPair.privateKey,keyPair.publicKey],
          (tx, resultSet) => { setId(resultSet.insertId)},
          (tx, error) => console.log(error)
          );
        }
      );
    }

    
    const recoverIdentity = (keyPair) =>{
      db.transaction(
        (tx) => {
          tx.executeSql("insert into identity (address, privateKey,publicKey,did) values (?,?,?,?)", 
          [keyPair.address,keyPair.privateKey,keyPair.publicKey , keyPair.did],
          (tx, resultSet) => { setId(resultSet.insertId)},
          (tx, error) => console.log(error)
          );
        }
      );
    }

    const createIdentity = async () => {
      setLoading(true)
      const keyPair = await DidService.createKeyPair()
      console.log("keyPair",keyPair)
      if(keyPair){
        console.log("entred")
        await addIdentity(db, keyPair)
        navigation.navigate('Register', { screen: 'Register' });
      }
      else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to generate keys'
        });
        setLoading(false)
      }
      SqliteService.getIdentity(db)
    }

    return (
      <>
      <Block flex style={styles.container}>
        <StatusBar hidden />
        <Block flex center>
        <ImageBackground
            source={Images.Onboarding}
            style={{ height, width, zIndex: 1 }}
          />
        </Block>
        <Block center>
          <Image source={Images.LogoOnboarding} style={styles.logo} />
        </Block>
        <Block flex space="between" style={styles.padded}>
       
            <Block flex space="around" style={{ zIndex: 2 }}>
              <Block style={styles.title}>
                <Block>
                  <Text color="white" size={25}>
                    Get Started
                  </Text>
                </Block>
                <Block>
                  <Text color="white" size={25}>
                    By Creating a new identity OR Recover Identity
                  </Text>
                </Block>
                <Block style={styles.subTitle}>
                  <Text color="white" size={16}>
                    Tunisian Self-Sovereign Identity Network (TSSIN)
                  </Text>
                </Block>
              </Block>
              <Block center>
               
                <Button
                  style={styles.button}
                  color={argonTheme.COLORS.SECONDARY}
                  onPress={createIdentity}
                  textStyle={{ color: argonTheme.COLORS.BLACK }}
                  loading={load}
                  loadingSize="large"
                >
                  Get Started
                </Button>
                <TouchableOpacity onPress={openModal}>
                  <Text color="white" size={16} bold>Recover Identity</Text>
                </TouchableOpacity>
              </Block>
          </Block>
        </Block>
      </Block>
      <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible1}
            onRequestClose={closeModal1}
        >
            <TouchableOpacity style={styles.centeredView} onPress={closeModal1}>
                <Block style={styles.modalView}>
                    <Block style={styles.card1}>
                        <Block style={styles.title2}>
                            <Text textStyle={{ color: "white", fontSize: 20, fontFamily: 'open-sans-bold' }} bold>
                                Enter your wallet recovery phrase :
                            </Text>
                        </Block>
                        <Block>
                            <TextInput onChangeText={setphrase}
                            value={phrase}
                               style={styles.input} multiline
                               numberOfLines={3} autoCorrect={false}/>
                        </Block>
                        <Block>
                            <Button style={styles.button2} onPress={importDB2}>
                                <Text style={{ fontFamily: 'open-sans-bold', color: "white" }}>
                                    Done
                                </Text>
                            </Button>
                        </Block>
                    </Block>
                </Block>
            </TouchableOpacity>
        </Modal>
        <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={closeModal}
        >
            <TouchableOpacity style={styles.centeredView} onPress={closeModal}>
                <Block style={styles.modalView}>
                    <Block style={styles.card1}>
                    <Block>
                        <Block style={styles.title2}>
                            <Text textStyle={{ color: "white", fontSize: 20, fontFamily: 'open-sans-bold' }} bold>
                            You can recover all your data if you have backed up the database. If not, you can recover your private key by collecting the fragments from your trustees.
                            </Text>
                        </Block>
                            <Block center>
                                <Button
                                    color={theme.COLORS.DEFAULT}
                                    textStyle={{ color: "white", fontSize: 15, fontFamily: 'open-sans-bold' }}
                                    style={styles.button}
                                    size="large"
                                    icon="database" iconFamily="antdesign" iconSize={20} iconColor="white"
                                    onPress={openModal1}
                                >
                                Restore Wallet
                              </Button>
                            </Block>
                            <Block center>
                                <Button
                                    color="#5E72E4"
                                    textStyle={{ color: "white", fontSize: 15, fontFamily: 'open-sans-bold' }}
                                    style={styles.button}
                                    size="large"
                                    icon="key" iconFamily="antdesign" iconSize={20} iconColor="white"
                                    onPress={openModal2}
                                >
                                    Recover Key
                                </Button>
                            </Block>
                            
                        </Block>
                    </Block>
                </Block>
            </TouchableOpacity>
        </Modal>
        <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible2}
            onRequestClose={closeModal2}
        >
            <TouchableOpacity style={styles.centeredView} onPress={closeModal2}>
                <Block style={styles.modalView}>
                    <Block style={styles.card1}>
                      <Block style={styles.title2}>
                        <Text textStyle={{ color: "white", fontSize: 20, fontFamily: 'open-sans-bold' }} bold>
                        You have collected {fragmentsList.length} fragment(s) right now. Click the button bellow to scan again. If you have collected enough fragments, click on "Done" button.
                        </Text>
                      </Block>
                      <Block center>
                                <Button
                                    color={theme.COLORS.DEFAULT}
                                    textStyle={{ color: "white", fontSize: 15, fontFamily: 'open-sans-bold' }}
                                    style={styles.button}
                                    size="large"
                                    icon="scan1" iconFamily="antdesign" iconSize={20} iconColor="white"
                                    onPress={scan}
                                >
                                Scan
                              </Button>
                            </Block>
                            <Block center>
                                <Button
                                    color="#5E72E4"
                                    textStyle={{ color: "white", fontSize: 15, fontFamily: 'open-sans-bold' }}
                                    style={styles.button}
                                    size="large"
                                    icon="check" iconFamily="antdesign" iconSize={20} iconColor="white"
                                    onPress={recoverKey}
                                >
                                  Done
                                </Button>
                            </Block>
                          </Block>
                </Block>
            </TouchableOpacity>
        </Modal>
        <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible3}
            onRequestClose={closeModal3}
        >
            <TouchableOpacity style={styles.centeredView} onPress={closeModal3}>
                    <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
                    />
                    {scanned && <Button onPress={() => setScanned(false)} size="small" 
                    style={{width: width , margin:0, borderRadius: 0, backgroundColor: "#172B4D"}}>Tap to Scan Again</Button>}
            </TouchableOpacity>
        </Modal>
      </>
    );

}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.COLORS.BLACK
  },
  padded: {
    paddingHorizontal: theme.SIZES.BASE * 2,
    position: "relative",
    bottom: theme.SIZES.BASE,
    zIndex: 2,
  },
  button: {
    width: width - theme.SIZES.BASE * 4,
    height: theme.SIZES.BASE * 3,
    shadowRadius: 0,
    shadowOpacity: 0
  },
  logo: {
    width: 200,
    height: 60,
    zIndex: 2,
    position: 'relative',
    marginTop: '-50%'
  },
  title: {
    marginTop:'-5%'
  },
  subTitle: {
    marginTop: 20
  },
  centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginTop: 22
    },
    modalView: {
        // margin: 20,
        backgroundColor: "white",
        // borderRadius: 20,
        // padding: 20,
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
        width: 320,
        height: 450
    },
    card1: {
        width: 320,
        height: 250
    },
    input: { // height: auto,
        marginTop: 0,
        margin: 20,
        borderWidth: 1,
        padding: 10
    },
    button2: {
        marginBottom: theme.SIZES.BASE,
        width: width * 0.8
    },
    title2: {
      padding: 20
  },
});

export default Onboarding;
