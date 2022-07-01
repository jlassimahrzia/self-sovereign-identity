import {React, useState, useEffect} from "react";
import { Dimensions , StyleSheet, Image} from 'react-native';
import { Block, Text, theme, Button} from "galio-framework";
const { width } = Dimensions.get('screen');
import SqliteService from "../services/SqliteService"
import argonTheme from "../constants/Theme";
import Images from "../constants/Images";
function Home() {
  const db = SqliteService.openDatabase()
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
    console.log("did",did)
  }, []);
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
            <Block style={styles.title}>
              <Text color="black" size={30} center>
                IdentityTN
              </Text>
            </Block>
            <Block style={styles.subTitle} >
                <Text color={argonTheme.COLORS.PRIMARY} size={20} center>
                Tunisian Self-Sovereign Identity Network (TSSIN) is an e-government platform for the benefit of citizens and society.
                Make paperwork become digital, easy and quick.
                </Text> 
            </Block>
            { did == null ? 
              <Block style={styles.subTitle}>
                <Text color={argonTheme.COLORS.MUTED} size={16} center>
                Your request is being processed 
                </Text> 
              </Block>: null
            }
            <Block center>
              <Image source={Images.homeImage} style={styles.image}/>
            </Block>
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
    marginTop: 80
  },
  image : {
    marginTop: 50,
    width : width*0.8,
    height: 300
  }
});

export default Home;
