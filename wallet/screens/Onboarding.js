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

function Onboarding({ navigation }) {

    const db = SqliteService.openDatabase()

    const [id, setId] = useState(null)
    const [load, setLoading] = useState(false)
    const [modalVisible1, setModalVisible1] = useState(false);
    const [phrase, setphrase] = useState("")
    const openModal1 = () => {
      setModalVisible1(true)
    };

    const closeModal1 = () => {
        setModalVisible1(false)
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
                <TouchableOpacity onPress={openModal1}>
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
