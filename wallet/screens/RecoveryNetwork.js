import {React, useState, useEffect} from "react";
import { Dimensions , StyleSheet, Image, ScrollView, Input, TextInput, Modal, TouchableOpacity,
     FlatList, RefreshControl, View} from 'react-native';
import { Block, Text, theme, Button} from "galio-framework";
const { width } = Dimensions.get('screen');
import { argonTheme, Images } from "../constants";
import { Icon } from "../components";
import { Formik } from 'formik';
import * as Yup from 'yup';
import DidService from "../services/DidService";
import BackupService from "../services/BackupService";
import SqliteService from "../services/SqliteService"
import Toast from 'react-native-toast-message';
import TrusteesRequest from "./TrusteesRequest";

const db = SqliteService.openDatabase()

function RecoveryNetwork() {

   
    const [modalVisible, setModalVisible] = useState(false);
    const [recoveryNetworkList, setrecoveryNetworkList] = useState([])
    const [ddo, setddo] = useState({})
    const [did, setDid] = useState()
    const [refreshing, setRefreshing] = useState(false);
    const [number, setnumber] = useState()
    const [threshold, setthreshold] = useState(0)
    const [participants, setparticipants] = useState(0)
    const [privateKey, setPrivateKey] = useState(null)

    const onRefresh = () => {
        setRefreshing(true);
        getIdentity()
        getRecoveryNetworkList()
        getRecoveryParameters()
        setRefreshing(false)
    };

    const addRecoveryParameters =  (n, t) =>{
         db.transaction(
          (tx) => {
            tx.executeSql("insert into recoveryParameters (participants, threshold) values (?,?)", 
            [n, t],
            (tx, resultSet) => { 
                return resultSet.insertId 
            },
            (tx, error) => console.log(error)
            );
          }
        );
      }

    const getIdentity = () => {
        db.transaction((tx) => {
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

    
    const getRecoveryParameters = () => {
        db.transaction((tx) => {
          tx.executeSql(
            `select * from recoveryParameters`,
            [],(transaction, resultSet) => { 
            //console.log(resultSet.rows); 
              if(resultSet.rows.length != 0){
                setparticipants(resultSet.rows._array[0].participants)
                setthreshold(resultSet.rows._array[0].threshold)
              }
            },
            (transaction, error) => console.log(error)
          );
        });
    }


    const getRecoveryNetworkList = async () => {
        let tab = await BackupService.getRecoveryNetworkList(did)
        setrecoveryNetworkList(tab)
    }

    const getAcceptedRequestNumber = () => {
        let res = recoveryNetworkList.filter( (item) => item.state === 1)
        setnumber(res.length)
    }

    useEffect(() => {
        getIdentity()
        getRecoveryNetworkList()
        getAcceptedRequestNumber()
        getRecoveryParameters()   
        console.log("dddd",participants , threshold, number, did); 
        /* db.transaction((tx) => {
            tx.executeSql(
              "drop table recoveryParameters"
            );
        }); */
    }, [])

    const didValidation = Yup.object().shape({
        did: Yup.string().required('You should enter a DID.'),
    });

    const recoveryPrametersValidation = Yup.object().shape({
        participants: Yup.number().required('You should enter the number of participants.'),
        threshold: Yup.number().required('You should enter the number of the minimum of fragment you should get to recover your key.'),
    });

    const openModal = (ddo) => {
        setddo(ddo)
        setModalVisible(true)
    };

    const closeModal = () => {
        setModalVisible(false)
    };

    const sendRequest = async () => {
        let res = await BackupService.sendTrusteeRequest(did, ddo.id)
        if(res){
            closeModal()
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: "Request sended successfully"
            });
            setddo({})
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

    const sendFragments = async () => {
        let res = await BackupService.sendFragments(did, privateKey, threshold)
        if(res){
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: "Fragments sended successfully"
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

    renderEmpty = () => {
        return <Text center style={{ fontFamily: 'open-sans-regular' , padding: 20}} color={argonTheme.COLORS.ERROR}>The list is empty</Text>;
    }

    return(
        <>
        <ScrollView
           refreshControl={
            <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
            } 
        >        
            <Block style={{padding:15}} >
                <Text bold  color="#e7413b" textStyle={{ fontSize: 20, fontFamily: 'open-sans-bold' }}>
                    WHAT IS RECOVERY NETWORK?
                </Text>
                <Text textStyle={{ color: "white", fontSize: 15}}>
                Recovery Network are close friends that you can call for help to get back into your account. 
                You will share fragments of your private key with your trustees. We will split your private key as trustees you add, 
                you need n participants and t threshold minimum number of fragments you should recover. 
                </Text>
                { ((participants !== 0) && (threshold !== 0)) ? 
                <Text>
                    You are asked to collect the DID of your trusted contacts. Number of participants is {participants} and the 
                    number of threshold is {threshold}.
                </Text>   : null }
            </Block> 
            
           { (participants === number) && (participants !== 0)? 
            <Block>
            <Block style={{ margin: 20  }}>
                <Text style={{paddingLeft: 10}} textStyle={{ color: "white", fontSize: 20, fontFamily: 'open-sans-bold' }} bold>
                    You have reached the number of participants requested click above to send the fragments of each participant.
                </Text>
                <Button style={styles.button} onPress={sendFragments}>
                    <Text style={{ fontFamily: 'open-sans-bold', color: "white" }}>
                        Send fragment to all participants
                    </Text>
                </Button>
            </Block>
            </Block>
          :
           null
            }
            { ((participants === 0) && (threshold === 0)) ?  <Formik
                validationSchema={recoveryPrametersValidation}
                initialValues={{ participants : "" , threshold : ""}}
                onSubmit={
                     (values, actions) =>{
                        let id =  addRecoveryParameters(values.participants, values.threshold)
                       /*  if(id){
                            actions.resetForm({
                                values: {participants : "" , threshold : ""}
                            }) */
                            onRefresh()
                            Toast.show({
                                type: 'success',
                                text1: 'Succes',
                                text2: "Recovery parameters added successfully"
                            });
                        /* }
                        else{
                            Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: "Something went wrong, "
                            });
                            actions.resetForm({
                                values: {participants : "" , threshold : ""}
                            })
                        } */
                    }
                }
            >
                {({ handleChange, handleBlur, handleSubmit, values , errors, touched}) => (
                    <View>
                    <Block>
                        <Block style={styles.title}>
                            <Text textStyle={{ color: "white", fontSize: 20, fontFamily: 'open-sans-bold' }} bold>
                                Enter the number of participants :
                            </Text>
                        </Block>
                        <TextInput
                            style={styles.input}
                            onChangeText={handleChange('participants')}
                            onBlur={handleBlur('participants')}
                            value={values.participants}
                        />
                        <Block row style={styles.passwordCheck}>
                            <Text size={12} color={argonTheme.COLORS.DEFAULT}>
                                {errors.participants && touched.participants ?  errors.participants : null }
                            </Text>
                        </Block>
                    </Block>
                    <Block>
                        <Block style={styles.title}>
                            <Text textStyle={{ color: "white", fontSize: 20, fontFamily: 'open-sans-bold' }} bold>
                                Enter the number of threshold :
                            </Text>
                        </Block>
                        <TextInput
                            style={styles.input}
                            onChangeText={handleChange('threshold')}
                            onBlur={handleBlur('threshold')}
                            value={values.threshold}
                        />
                        <Block row style={styles.passwordCheck}>
                            <Text size={12} color={argonTheme.COLORS.DEFAULT}>
                                {errors.threshold && touched.threshold ?  errors.threshold : null }
                            </Text>
                        </Block>
                    </Block>
                    <Block center style={{padding:10}}>
                        <Button small color={theme.COLORS.DEFAULT} onPress={handleSubmit} textStyle={{ color: "white" }}>
                            Store
                        </Button>
                    </Block> 
                    </View>
             )}
            </Formik> : 
            null
           /*  <Formik
            validationSchema={didValidation}
            initialValues={{ did: ""}}
            onSubmit={
                async (values, actions) =>{
                    let result = await DidService.getProfile(values.did)
                    if(result.test){
                        openModal(result.ddo)
                        actions.resetForm({
                            values: { did : "" }
                        })
                    }
                    else{
                        Toast.show({
                            type: 'error',
                            text1: 'Error',
                            text2: result.msg
                        });
                    }
                }
            }
        >
            {({ handleChange, handleBlur, handleSubmit, values , errors, touched}) => (
                <View>
                <Block>
                    <Block style={styles.title}>
                        <Text textStyle={{ color: "white", fontSize: 20, fontFamily: 'open-sans-bold' }} bold>
                            Enter DID :
                        </Text>
                    </Block>
                    <TextInput
                        style={styles.input}
                        onChangeText={handleChange('did')}
                        onBlur={handleBlur('did')}
                        value={values.did}
                    />
                    <Block row style={styles.passwordCheck}>
                        <Text size={12} color={argonTheme.COLORS.DEFAULT}>
                            {errors.did && touched.did ?  errors.did : null }
                        </Text>
                    </Block>
                </Block>
                <Block center style={{padding:10}}>
                    <Button small color={theme.COLORS.DEFAULT} onPress={handleSubmit} textStyle={{ color: "white" }}>
                        Send request
                    </Button>
                </Block> 
                </View>
         )}
            </Formik>  */
            }
            <Block style={{padding:15}} center >
                <Text bold  color="#e7413b" textStyle={{ fontSize: 20, fontFamily: 'open-sans-bold' }}>
                    LIST OF REQUESTS
                </Text>
            </Block>
        { recoveryNetworkList ?  
        <FlatList
                    data={recoveryNetworkList}
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
                                                                style={{width : width*0.4}}
                                                                color={argonTheme.COLORS.SUCCESS}
                                                            >
                                                                Accepted
                                                            </Text> : null}
                                                            {item.state === 0 ? <Text
                                                                style={{ fontFamily: 'open-sans-regular' }}
                                                                style={{width : width*0.4}}
                                                                color={argonTheme.COLORS.WARNING}
                                                            >
                                                                Pending
                                                            </Text> : null}
                                                            {item.state === 2 ? <Text
                                                                style={{ fontFamily: 'open-sans-regular' }}
                                                                style={{width : width*0.4}}
                                                                color={argonTheme.COLORS.PRIMARY}
                                                            >
                                                                Declined
                                                            </Text> : null}
                                        </Block>
                                    </Block>
                            </Block>
                        </Block>
                        </Block>
                    )}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={renderEmpty}
                /> : null }
        </ScrollView>
        <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={closeModal}
        >
            <TouchableOpacity style={styles.centeredView} onPress={closeModal}>
                <Block style={styles.modalView}>
                    <Block style={styles.card}>
                        <Block middle style={styles.avatarContainer}>
                            <Image
                                source={Images.ProfilePicture}
                                style={styles.avatar}
                            />
                        </Block>
                        <Block flex>
                            <Block middle style={styles.nameInfo}>
                                <Text bold size={28} color="#32325D">
                                  {ddo.firstname} {ddo.lastname}
                                </Text>
                                <Text size={16} color="#32325D" style={{ marginTop: 10 }}>
                                  {ddo.email}
                                </Text>
                            </Block>
                        </Block>
                        <Block style={{ margin: 20  }}>
                            <Button style={styles.button} onPress={sendRequest}>
                                <Text style={{ fontFamily: 'open-sans-bold', color: "white" }}>
                                    Confirm
                                </Text>
                            </Button>
                        </Block>
                    </Block>
                </Block>
            </TouchableOpacity>
        </Modal>  
        </>
    )
}

const styles = StyleSheet.create({
    title: {
        padding: 20
    },
    input: { // height: auto,
        marginTop: 0,
        marginBottom: 0,
        margin: 20,
        borderWidth: 1,
        padding: 10
    },
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
    card: {
        width: 320,
        height: 380
    },
    
  avatarContainer: {
    position: "relative",
    marginTop: 40
  },
  
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 0
  },
  
  nameInfo: {
    marginTop: 35
  },
  
  cart: {
    width: width
}
})

export default RecoveryNetwork;