import {React, useState, useEffect} from "react";
import { Dimensions , StyleSheet, Image, RefreshControl, FlatList, Modal, TouchableOpacity, View, ScrollView} from 'react-native';
import { Block, Text, theme, Button} from "galio-framework";
const { width } = Dimensions.get('screen');
import SqliteService from "../services/SqliteService"
import BackupService from "../services/BackupService";
import { argonTheme } from "../constants";
import { Icon } from "../components";
import Toast from 'react-native-toast-message';
import { BarCodeScanner } from 'expo-barcode-scanner';
function TrusteesRequest() {
    const db = SqliteService.openDatabase()
    const [trusteesRequestsList, settrusteesRequestsList] = useState([])
    const [privateKey, setPrivateKey] = useState(null)
    const [refreshing, setRefreshing] = useState(false);
    const [did, setDid] = useState()
    const [modalVisible, setModalVisible] = useState(false);
    const [hasPermission, setHasPermission] = useState(null)
    const [scanned, setScanned] = useState(false)
    const [trusteesFragmentList, settrusteesFragmentList] = useState([])

    const openModal = () => {
        setModalVisible(true)
    };

    const closeModal = () => {
        setModalVisible(false)
    };

    const onRefresh = () => {
        setRefreshing(true);
        getIdentity()
        gettrusteesRequestsList()
        getFragments()
        setRefreshing(false)
    };

    const getIdentity = async () => {
        await db.transaction((tx) => {
          tx.executeSql(
            `select * from identity`,
            [],(transaction, resultSet) => { 
              if(resultSet.rows.length != 0){
                setDid(resultSet.rows._array[0].did)
                setPrivateKey(resultSet.rows._array[0].privateKey)
              }
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
        else{
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "Something went wrong, try again!"
            });
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
        else{
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "Something went wrong, try again!"
            });
        }
        
    }

    useEffect(() => {
        getIdentity()
        gettrusteesRequestsList()
        getFragments()
        console.log("trusteesFragmentList",trusteesFragmentList);
    }, [])

    const scan = () => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
            openModal()
        })();
        
    }

    const addFragment = async (idRequest, fragment) =>{
        await db.transaction(
          (tx) => {
            tx.executeSql("insert into trusteesFragment (idRequest, fragment) values (?,?)", 
            [idRequest, JSON.stringify(fragment)],
            (tx, resultSet) => { 
                return resultSet.insertId 
            },
            (tx, error) => console.log(error)
            );
          }
        );
    }

    const getFragments = async () => {
        await db.transaction((tx) => {
          tx.executeSql(
            `select * from trusteesFragment`,
            [],(transaction, resultSet) => settrusteesFragmentList(resultSet.rows._array),
            (transaction, error) => console.log(error)
          );
        });
    }

    const handleBarCodeScanned = async ({ type, data }) => {
        setScanned(true);
        data = JSON.parse(data)
        let result = await BackupService.decryptFragment(data, privateKey)
        if(result.test){
            let fragment 
            Object.keys(result.decrypted).map((item) => {
                if(item !== 'idRequest')
                    fragment = {...fragment, [item] : result.decrypted[item]}
            })
            let id = addFragment(result.decrypted.idRequest, fragment)
            if(id){
                Toast.show({
                    type: 'info',
                    text1: 'Success',
                    text2: "Fragment added successfully"
                });
                closeModal()
                onRefresh()
            }
            else{
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: "Something went wrong, try again!"
                });
            }
        }
        else{
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "Something went wrong, try again!"
            });
        }
    };


    const getFragmentById = (id) => {
        let data = trusteesFragmentList.filter( (item) => item.idRequest === id)
        
        return data[0]
    }


    const sendFragmentToHolder = async (didHolder , fragment) => {
        let done = await BackupService.sendFragmentToHolder(didHolder , fragment)
        if(done){
            Toast.show({
                type: 'info',
                text1: 'Success',
                text2: "Fragment sended successfully"
            });
        }
        else{
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "Something went wrong, try again!"
            });
        }
    }

    return(
        <ScrollView
            refreshControl={
            <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
            } 
        >
        <Block style={{paddingTop: 30}}>

            <Block>
                <Block style={{ marginVertical: theme.SIZES.BASE / 2, marginHorizontal: theme.SIZES.BASE, }}>
                    <Text style={{paddingLeft: 10}} textStyle={{ color: "white", fontSize: 20, fontFamily: 'open-sans-bold' }} bold>
                        Scan the QR code to get your friend fragment, to help him later to recover his private key.
                    </Text>
                    <Button style={styles.button} onPress={scan} style={{width : width *0.85}}>
                        <Text style={{ fontFamily: 'open-sans-bold', color: "white" }}>
                            Scan QR code
                        </Text>
                    </Button>
                </Block>
            </Block>

        { trusteesRequestsList ?  
        <FlatList
            
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
                            {
                                getFragmentById(item.id)?.id ?  
                                    <Button style={styles.button} onPress={ () => sendFragmentToHolder(item.did_holder , getFragmentById(item.id)?.fragment)}>
                                        <Text style={{ fontFamily: 'open-sans-bold', color: "white" }}>
                                            Send Fragment
                                        </Text>
                                    </Button>
                                : null
                            }
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

        <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={closeModal}
        >
            <TouchableOpacity style={styles.centeredView} onPress={closeModal}>
                    <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
                    />
                    {scanned && <Button onPress={() => setScanned(false)} size="small" 
                    style={{width: width , margin:0, borderRadius: 0, backgroundColor: "#172B4D"}}>Tap to Scan Again</Button>}
            </TouchableOpacity>
        </Modal>
        </Block>
        </ScrollView>
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
        width: width * 0.8
    }, 
    passwordCheck: {
        paddingLeft: 20,
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
    container: {
        flex: 1,
      }
})
export default TrusteesRequest;