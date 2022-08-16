import {Block, Text, theme, Accordion} from "galio-framework";
import SqliteService from "../services/SqliteService"
import {React, useState, useEffect} from "react";
import {RefreshControl, ScrollView, SafeAreaView, Dimensions} from "react-native";
const {width} = Dimensions.get("screen");


const db = SqliteService.openDatabase()

function Settings() {

    const [did, setDid] = useState(null)
    const [address, setAddress] = useState(null)
    const [data, setData] = useState([])

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true)
        getIdentity()
        setData([
            {
                title: "DID",
                content: did
            }, {
                title: "Address",
                content: address
            }
        ])
        console.log("did", did, "address", address)
        setRefreshing(false)
    };

    const getIdentity = () => {
        db.transaction((tx) => {
            tx.executeSql(`select * from identity`, [], (transaction, resultSet) => {s
                setData([
                    {
                        title: "DID",
                        content: resultSet.rows._array[0].did
                    }, {
                        title: "Address",
                        content: resultSet.rows._array[0].address
                    }
                ])
            }, (transaction, error) => console.log(error));
        });
    }

    useEffect(() => {
        getIdentity()
    }, []);

    return(
        <SafeAreaView>
          <ScrollView
          refreshControl={
            <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
          }>
              <Text center size={34} style={{ paddingTop: theme.SIZES.BASE,paddingBottom: theme.SIZES.BASE / 2}}>
                  Settings 
              </Text>
              <Block center style={{ width : width }}>
                  <Accordion dataArray={data} />
              </Block>
          </ScrollView>
        </SafeAreaView>
      )
}


export default Settings;
