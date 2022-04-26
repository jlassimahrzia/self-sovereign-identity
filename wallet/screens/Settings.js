
import { Block, Text, theme, Accordion } from "galio-framework";
import SqliteService from "../services/SqliteService"
import {React, useState, useEffect} from "react";

function Settings() {
  const db = SqliteService.openDatabase()
  const [did, setDid] = useState(null)
  const [address, setAddress] = useState(null)
  const [data, setData] = useState([])
  const getIdentity = async () => {
    await db.transaction((tx) => {
      tx.executeSql(
        `select * from identity`,
        [],(transaction, resultSet) => { 
          if(resultSet.rows.length != 0){
            setDid(resultSet.rows._array[0].did)
            setAddress(resultSet.rows._array[0].address)}
            console.log(resultSet.rows._array)
        },
        (transaction, error) => console.log(error)
      );
    });
  }
  useEffect(() => {
    getIdentity()
    setData([{ title: "DID", content: did},
    { title: "Address", content: address }])
    console.log("did",did,"address",address)
  }, []);
    return(
        <Block center style={{ paddingHorizontal: theme.SIZES.BASE }}>
            <Text center size={34} style={{ paddingTop: theme.SIZES.BASE,paddingBottom: theme.SIZES.BASE / 2}}>
                Settings 
            </Text>
            <Block style={{ height: 200 }}>
                <Accordion dataArray={data} />
            </Block>
        </Block>
    )
}

export default Settings;