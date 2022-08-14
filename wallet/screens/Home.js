import {React, useState, useEffect} from "react";
import { Dimensions , StyleSheet, Image} from 'react-native';
import { Block, Text, theme, Button} from "galio-framework";
const { width } = Dimensions.get('screen');
import SqliteService from "../services/SqliteService"
import argonTheme from "../constants/Theme";
import Images from "../constants/Images";
import { AntDesign } from '@expo/vector-icons';

const db = SqliteService.openDatabase()

function Home() {
  
  const [did, setDid] = useState(null)
  
  const getIdentity = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `select * from identity`,
        [],(transaction, resultSet) => { 
          if(resultSet.rows.length != 0){
            setDid(resultSet.rows._array[0].did)}},
        (transaction, error) => console.log(error)
      );
    });
  }
  useEffect(() => {
    getIdentity()

    return () => {
      setDid(null); // This worked for me
    };

    console.log("did",did)
  }, []);


  /* if(!did) {
    return null;
  } */



  const showToast = () => {
    Toast.show({
      type: 'success',
      text1: 'Hello',
      text2: 'This is some something 👋'
    });
  }
  const deletex = () => {
    //SqliteService.deleteTable(db)
    SqliteService.getIdentity(db)
  }
  return(
      <Block center style={{ paddingHorizontal: theme.SIZES.BASE }}>
        <Block flex >
          <Block >
            <Block center>
              <Image source={Images.homeImage} style={styles.image}/>
            </Block>
            <Block style={styles.title}>
              <Text color={argonTheme.COLORS.PRIMARY} size={30} center>
                IdentityTN
              </Text>
            </Block>
            <Block style={styles.subTitle} >
                <Text color="black" size={16}>
                  Tunisian Self-Sovereign Identity Network (TSSIN) is an e-government platform for the benefit of citizens and society.
                  Make paperwork become digital, easy and quick.
                </Text> 
            </Block>
            <Block style={styles.subTitle}>
                <Text color="black" size={16} >
                  <AntDesign name="checkcircleo" size={15} color={argonTheme.COLORS.PRIMARY} />
                  &nbsp; Connect with services and build network that you fully control.
                </Text> 
                <Text color="black" size={16}>
                  <AntDesign name="checkcircleo" size={15} color={argonTheme.COLORS.PRIMARY} />
                  &nbsp; Request, receive and share information about yourself.
                </Text> 
            </Block>
            { did == null ? 
              <Block style={styles.subTitle}>
                <Text color={argonTheme.COLORS.SUCCESS} size={16} center>
                Your request is being processed 
                </Text> 
              </Block>: null
            }
            
          </Block>
          
        </Block>
      </Block>
  )

}
const styles = StyleSheet.create({
  subTitle: {
    marginTop: 20
  },
  title : {
    marginTop: 20
  },
  image : {
    marginTop: 50,
    width : width*0.8,
    height: 260
  }
});

export default Home;
