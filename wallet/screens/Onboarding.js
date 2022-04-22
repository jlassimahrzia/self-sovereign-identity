import {React, useEffect, useState} from 'react'
import {
  ImageBackground,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions
} from "react-native";
import { Block, Button, Text, theme } from "galio-framework";
const { height, width } = Dimensions.get("screen");
import argonTheme from "../constants/Theme";
import Images from "../constants/Images";

import SqliteService from "../services/SqliteService"
import DidService from '../services/DidService';

function Onboarding({ navigation }) {

    const db = SqliteService.openDatabase()

    const [id, setId] = useState(null)

    useEffect(() => {
      SqliteService.createIdentityTable(db)
    }, []);

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
      //SqliteService.deleteTable(db)
      const keyPair = await DidService.createKeyPair()
      addIdentity(db, keyPair);
      if(id){
        const res = await DidService.sendDidRequest(keyPair.address, keyPair.publicKey)
        if(res){
          navigation.navigate("App")
        }
      }
    }

    return (
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
                >
                  Get Started
                </Button>
              </Block>
          </Block>
        </Block>
      </Block>
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
