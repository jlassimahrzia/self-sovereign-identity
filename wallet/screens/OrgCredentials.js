
import { useEffect, useState } from "react";
import { StyleSheet, Dimensions, FlatList, Modal } from "react-native";
import { Block, Text,theme ,Button, view} from "galio-framework";
import { Card } from "../components";
import { Icon } from "../components";
import { argonTheme } from "../constants";
import { Feather, Ionicons } from '@expo/vector-icons'; 
import { AntDesign } from '@expo/vector-icons';
import IssuerService from "../services/IssuerService";
import Toast from 'react-native-toast-message';
import SqliteService from "../services/SqliteService"
const { width } = Dimensions.get("screen");

renderEmpty = () => {
    return <Text style={{ fontFamily: 'open-sans-regular' }} color={argonTheme.COLORS.ERROR}>The list is empty</Text>;
}

function OrgCredentials({ route, navigation }) {
    const { org } = route.params;
    const db = SqliteService.openDatabase()
    const [modalVisible, setModalVisible] = useState(false);
    const [credentials, setCredentials] = useState([]);
    const [schema, setSchema] = useState({});
    const [did, setDid] = useState(null)
    const [credential, setCredential] = useState({})

    const getIdentity = async () => {
        await db.transaction((tx) => {
          tx.executeSql(
            `select * from identity`,
            [],(transaction, resultSet) => { 
              if(resultSet.rows.length != 0){
                setDid(resultSet.rows._array[0].did)
                }
            },
            (transaction, error) => console.log(error)
          );
        });
    }

    const retrieveCredentialsList = async () => {
        let data = await IssuerService.getSchemasList(org.did)
        let finalRes = [];
        data.forEach((schemaRes, id) => {
            let name = schemaRes[0];
            let path = schemaRes[1];
            let result = {
                id,
                name,
                path
            }
            finalRes.push(result);
        });
        return finalRes;
    }

    const openModal = async (item) => {
        setCredential(item)
        let data = await IssuerService.resolveSchema(org.did,item.name)
        let properties = Object.entries(data.properties.credentialSubject.properties);
        let finaleSchema = {
            title : data.title,
            description : data.description,
            properties : properties
        }
        setSchema(finaleSchema)
        setModalVisible(true)
    };

    const closeModal = () => {
        setModalVisible(false)
        setSchema({})
        setCredential({})
    };

    const sendRequest = async () => {
        let id = await IssuerService.sendVcRequest(did , org.did, credential.name)
        if(id){
            Toast.show({
                type: 'success',
                text1: 'Info',
                text2: 'Your request is being processed'
            });
        }
        else {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to send Credential Request'
            });
        }
        closeModal()
    }

    useEffect(() => {
        retrieveCredentialsList().then((res) => {
            setCredentials(res);
        });
        getIdentity()
    }, [])
    
    return(
        <>
        <Block flex center style={styles.cart}>
        <FlatList
            data={credentials}
            renderItem={({item}) => (
                    <Block card shadow style={styles.product}>
                        <Block row style={styles.productDescription}>
                            <Block style={{width: width*0.15}}>
                                <Feather name="credit-card" size={24} color={argonTheme.COLORS.PRIMARY} 
                                style={{marginTop: 6, marginBottom: 6}} />
                            </Block>
                            <Block style={{width: width*0.60, marginTop: 6, marginBottom: 6}}>
                                <Text size={16} style={styles.productTitle} color={argonTheme.COLORS.BLACK}
                                    style={{fontWeight: "bold"}}>
                                    {item.name}
                                </Text>
                            </Block>
                            <Block style={{width: width*0.25}}>
                                <Button onlyIcon icon="search1" iconFamily="antdesign" iconSize={15} 
                                color={argonTheme.COLORS.PRIMARY} iconColor="#fff" 
                                style={{ width: 28, height: 28 }} onPress={() => openModal(item)}>
                                </Button>
                            </Block>
                        </Block>
                    </Block>
            )}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => `${index}-${item.id}`}
            ListEmptyComponent={renderEmpty}
        />
        </Block> 
           <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
            >
            <Block style={styles.centeredView}>
                <Block style={styles.modalView}>
                    {/** Start */}
                    <Block style={styles.card}>
                        <Block flexDirection="row-reverse" style={{margin: 3}}>
                            <AntDesign name="closesquareo" size={24} color={argonTheme.COLORS.PRIMARY} 
                            onPress={closeModal}/>
                        </Block>
                        <Block style={styles.cardHeader}>
                            <Text
                            size={16}
                            style={{ fontFamily: "open-sans-bold" }}
                            color={argonTheme.COLORS.TEXT}
                            >
                                {schema.title}
                            </Text>
                            <Text
                                color={argonTheme.COLORS.BLACK}
                                size={14}
                                style={{ fontFamily: "open-sans-regular"}}
                            >
                                {schema.description}
                            </Text>
                        </Block>
                        {  schema.properties ? 
                            (schema.properties.map((item, index) => {
                                return ( 
                                <Block column style={{ paddingRight: 3, paddingLeft: 12, margin: 5 }}
                                key={index}>
                                    <Block row space="between" style={{ height: 18 }}>
                                        <Text color={argonTheme.COLORS.MUTED1} style={{ fontFamily: 'open-sans-bold' }} size={14}>
                                            {item[0]}
                                        </Text>
                                    </Block>
                                    <Text
                                        color={argonTheme.COLORS.BLACK}
                                        size={14}
                                        style={{ fontFamily: "open-sans-regular"}}
                                    >
                                        { item[1].description ?  item[1].description : null } 
                                    </Text>
                                </Block>
                            );}))
                        : null}
                        
                        <Block style={{ margin: 5  }}>
                        <Button style={styles.button} onPress={sendRequest}>
                            <Text style={{ fontFamily: 'open-sans-bold', color: "white" }}>
                                Send Request
                            </Text>
                        </Button>
                    </Block>
                    </Block>
                    {/** End */}
                </Block>
            </Block>
            </Modal> 
        </>
    )
}

const styles = StyleSheet.create({
    products: {
      width: width - theme.SIZES.BASE * 2,
      paddingVertical: theme.SIZES.BASE
    },
    cart: {
        width: width
    },
    product: {
      width: width * 0.9,
      borderWidth: 0,
      marginVertical: theme.SIZES.BASE,
      marginHorizontal: theme.SIZES.BASE,
      backgroundColor: theme.COLORS.WHITE,
      shadowColor: "black",
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: theme.SIZES.BASE / 4,
      shadowOpacity: 0.1
    },
    productDescription: {
        padding: theme.SIZES.BASE / 2
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        //borderRadius: 20,
        padding: 20,
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
        width: 280,
        backgroundColor: argonTheme.COLORS.WHITE,
    },
    cardHeader: {
        borderColor: 'rgba(0,0,0,0.2)',
        //borderBottomWidth: StyleSheet.hairlineWidth
    },
    button: {
        marginBottom: theme.SIZES.BASE,
        width: "100%"
    }
});

export default OrgCredentials;
