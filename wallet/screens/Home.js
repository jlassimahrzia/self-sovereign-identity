import {React, useState, useEffect} from "react";
import { Dimensions } from 'react-native';
import { Block, Text, theme, Button} from "galio-framework";
const { width } = Dimensions.get('screen');
import SqliteService from "../services/SqliteService"
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
        <Text center size={34} style={{ paddingTop: theme.SIZES.BASE,paddingBottom: theme.SIZES.BASE / 2}}>
          WELCOME
        </Text>
        <Button onPress={deletex}>Welcome </Button>
        { did == null ? <Text 
          center
          size={16}
          color={theme.COLORS.MUTED}
          style={{ paddingTop: theme.SIZES.BASE }}
        >
          Your request is being processed 
        </Text> :  <Text 
          center
          size={16}
          color={theme.COLORS.MUTED}
          style={{ paddingTop: theme.SIZES.BASE }}
        >
          Welcome to Tunisian Self-Sovereign Identity Network (TSSIN)
        </Text>
        }
      </Block>
  )

}

export default Home;
