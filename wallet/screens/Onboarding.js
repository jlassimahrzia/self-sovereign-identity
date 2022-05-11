import {React, useEffect, useState} from 'react'
import {
  ImageBackground,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions
} from "react-native";
import { Block, Button, Text, theme} from "galio-framework";
const { height, width } = Dimensions.get("screen");
import argonTheme from "../constants/Theme";
import Images from "../constants/Images";

import SqliteService from "../services/SqliteService"
import DidService from '../services/DidService';
import Toast from 'react-native-toast-message';

function Onboarding({ navigation }) {

    const db = SqliteService.openDatabase()

    const [id, setId] = useState(null)
    const [load, setLoading] = useState(false)

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
                  <Text color="white" size={60}>
                    Get Started
                  </Text>
                </Block>
                <Block>
                  <Text color="white" size={30}>
                    By Creating a new identity
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
              </Block>
          </Block>
        </Block>
      </Block>
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
  }
});

export default Onboarding;
