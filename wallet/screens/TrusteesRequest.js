import {React, useState, useEffect} from "react";
import { Dimensions , StyleSheet, Image, RefreshControl, FlatList} from 'react-native';
import { Block, Text, theme, Button} from "galio-framework";
const { width } = Dimensions.get('screen');
import SqliteService from "../services/SqliteService"
import BackupService from "../services/BackupService";
import { argonTheme } from "../constants";
import { Icon } from "../components";
import Toast from 'react-native-toast-message';
function TrusteesRequest() {
    const db = SqliteService.openDatabase()
    const [trusteesRequestsList, settrusteesRequestsList] = useState([])
    const [refreshing, setRefreshing] = useState(false);
    const [did, setDid] = useState()

    const onRefresh = () => {
        setRefreshing(true);
        getIdentity()
        gettrusteesRequestsList()
        setRefreshing(false)
    };

    const getIdentity = async () => {
        await db.transaction((tx) => {
          tx.executeSql(
            `select * from identity`,
            [],(transaction, resultSet) => { 
              if(resultSet.rows.length != 0){
                setDid(resultSet.rows._array[0].did)}
            },
            (transaction, error) => console.log(error)
          );
        });
    }

    const gettrusteesRequestsList = async () => {
        let tab = await BackupService.gettrusteeRequestList(did)
        settrusteesRequestsList(tab)
    }

    const acceptRequest = async (id) => {
        let res = await BackupService.acceptRequest(id)
        if(res === 1) {
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: "Request accepted successfully"
            });
            onRefresh()
        }
       
    }

    const declineRequest = async (id) => {
        let res = await BackupService.declineRequest(id)
        console.log(res);
        if(res === 1){
            Toast.show({
                type: 'info',
                text1: 'Success',
                text2: "Request declined successfully"
            });
            onRefresh()
        }
        
    }

    useEffect(() => {
        getIdentity()
        gettrusteesRequestsList()
    }, [])

    return(
        <Block style={{paddingTop: 30}}>
        { trusteesRequestsList ?  
        <FlatList
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            }
            data={trusteesRequestsList}
            renderItem={({item}) => (
                <Block>
                <Block card shadow style={styles.product}>
                    <Block style={styles.rightSide}>
                            <Text size={16} style={styles.productTitle} color={argonTheme.COLORS.BLACK}
                                style={{fontWeight: "bold", paddingLeft: 5}}>
                                {item.ddo?.firstname} {item.ddo?.lastname}
                            </Text>
                            <Text size={14} muted style={{marginVertical: 5, paddingLeft: 5}}>
                                {item.ddo?.email}
                            </Text>
                            <Block row space="between" style={{paddingLeft: 5}}>
                                <Block bottom>
                                    <Text
                                        style={{ fontFamily: 'open-sans-regular' }}
                                        style={{width : width*0.6}}
                                        color={argonTheme.COLORS.ACTIVE}
                                    >
                                        <Icon
                                            family="material-community"
                                            name="calendar-blank-outline"
                                            size={14}
                                            color={argonTheme.COLORS.PRIMARY}
                                        />
                                        <Text
                                            color={argonTheme.COLORS.MUTED}
                                            style={{
                                                fontFamily: "open-sans-regular",
                                                marginLeft: 3,
                                                marginTop: -3
                                            }}
                                            size={14}
                                        >
                                           {item.date.substring(0,10)}
                                        </Text>
                                    </Text> 
                                </Block>
                                <Block bottom>
                                                    {item.state === 1 ? <Text
                                                        style={{ fontFamily: 'open-sans-regular' }}
                                                        style={{width : width*0.5}}
                                                        color={argonTheme.COLORS.SUCCESS}
                                                    >
                                                        Accepted
                                                    </Text> : null}
                                                    {item.state === 0 ? <Text
                                                        style={{ fontFamily: 'open-sans-regular' }}
                                                        style={{width : width*0.5}}
                                                        color={argonTheme.COLORS.WARNING}
                                                    >
                                                        Pending
                                                    </Text> : null}
                                                    {item.state === 2 ? <Text
                                                        style={{ fontFamily: 'open-sans-regular' }}
                                                        style={{width : width*0.5}}
                                                        color={argonTheme.COLORS.PRIMARY}
                                                    >
                                                        Declined
                                                    </Text> : null}
                                </Block>
                            </Block>

                           { item.state === 0 ? <Block row style={{ marginTop: theme.SIZES.BASE, width: width * 0.78}}>
                                <Button color="secondary" style={{width: width*0.37}} onPress={ () => declineRequest(item.id)}>
                                    <Text style={{ fontFamily: 'open-sans-regular',textAlign: 'center' }} size={14} 
                                    color={argonTheme.COLORS.BLACK}>Decline </Text>
                                </Button>
                                <Button color="success" style={{width: width*0.37}} onPress={ () => acceptRequest(item.id)}>
                                    <Text style={{ fontFamily: 'open-sans-regular' }} size={16}
                                    color={argonTheme.COLORS.WHITE}> Accept</Text>
                                </Button>
                            </Block> : null}
                            
                    </Block>
                </Block>
                </Block>
            )}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmpty}
        /> : null }
        </Block>
    )
}


const styles = StyleSheet.create({

    productTitle: {
        fontFamily: 'open-sans-bold',
        flex: 1,
        flexWrap: "wrap",
        paddingBottom: 6
    },
    product: {
        width: width * 0.90,
        borderWidth: 0,
        marginVertical: theme.SIZES.BASE / 2,
        marginHorizontal: theme.SIZES.BASE,
        backgroundColor: theme.COLORS.WHITE,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: theme.SIZES.BASE / 4,
        shadowOpacity: 0.1
    },
    rightSide : {
        width: width*0.8, 
        padding: 15,
        borderLeftColor: "#dadde1",
        borderStyle: "solid",
        borderLeftWidth: 1
    },
    
    button: {
        marginTop: theme.SIZES.BASE,
        width: width * 0.78
    }, 
    passwordCheck: {
        paddingLeft: 20,
    }
})
export default TrusteesRequest;