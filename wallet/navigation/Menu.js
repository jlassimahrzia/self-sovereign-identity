import { Block, Text, theme } from "galio-framework";
import { Image, ScrollView, StyleSheet } from "react-native";

import { DrawerItem as DrawerCustomItem } from "../components";
import Images from "../constants/Images";
import {React, useState, useEffect} from "react";
import SqliteService from "../services/SqliteService"

function CustomDrawerContent({
  drawerPosition,
  navigation,
  profile,
  focused,
  state,
  ...rest
}) {
  
  const db = SqliteService.openDatabase()
  const [did, setDid] = useState(null)
  const [routes, setRoutes] = useState([])

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
  const screens = ["Home", "QR-Code", "Credentials", "Organisations", "Verifiers", "Profile","Settings"];
  const screens2 = ["Home", "QR-Code", "Profile","Settings"];
  useEffect(() => {
    getIdentity()
    console.log("fom appstack", did)
    setRoutes([...screens])
    /* if(did !== null){
      setRoutes([...screens])
    }
    else {
      //setRoutes([...screens2])
      setRoutes([...screens])
    } */
  }, []);


  
  return (
    <Block
      style={styles.container}
      forceInset={{ top: "always", horizontal: "never" }}
    >
      <Block flex={0.06} style={styles.header}>
        <Image styles={styles.logo} source={Images.Logo} />
      </Block>
      <Block flex style={{ paddingLeft: 8, paddingRight: 14 }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {routes.map((item, index) => {
            return (
              <DrawerCustomItem
                title={item}
                key={index}
                navigation={navigation}
                focused={state.index === index ? true : false}
              />
            );
          })}
        </ScrollView>
          {/* <Block
            flex
            style={{ marginTop: 24, marginVertical: 8, paddingHorizontal: 8 }}
          >
            <Block
              style={{
                borderColor: "rgba(0,0,0,0.2)",
                width: "100%",
                borderWidth: StyleSheet.hairlineWidth,
              }}
            />
            <Text color="#8898AA" style={{ marginTop: 16, marginLeft: 8 }}>
              DOCUMENTATION
            </Text>
          </Block>
          <DrawerCustomItem title="Getting Started" navigation={navigation} /> */}
       
      </Block>
    </Block>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 28,
    paddingBottom: theme.SIZES.BASE,
    paddingTop: theme.SIZES.BASE * 1.5,
    justifyContent: "center",
  },
});

export default CustomDrawerContent;
