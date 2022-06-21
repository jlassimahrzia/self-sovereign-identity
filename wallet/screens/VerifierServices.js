
import { useEffect, useState } from "react";
import { StyleSheet, Dimensions, FlatList, Modal, View , ScrollView} from "react-native";
import { Block, Text,theme ,Button, view} from "galio-framework";
import { Card } from "../components";
import { Icon } from "../components";
import { argonTheme } from "../constants";
import { Feather, Ionicons } from '@expo/vector-icons'; 
import { AntDesign } from '@expo/vector-icons';
import VerifierService from "../services/VerifierService";
import IssuerService from "../services/IssuerService";
import Toast from 'react-native-toast-message';
import SqliteService from "../services/SqliteService"
import ViewMoreText from 'react-native-view-more-text';
const { width } = Dimensions.get("screen");

renderEmpty = () => {
    return <Text style={{ fontFamily: 'open-sans-regular' }} color={argonTheme.COLORS.ERROR}>The cart is empty</Text>;
}

renderViewMore = (onPress) => {
  return(
    <Text onPress={onPress} color={argonTheme.COLORS.PRIMARY}>View more</Text>
  )
}
renderViewLess = (onPress) =>{
  return(
    <Text onPress={onPress} color={argonTheme.COLORS.PRIMARY}>View less</Text>
  )
}

function VerifierServices({ route, navigation }) {
    const { verifier } = route.params;
    const db = SqliteService.openDatabase()
    const [modalVisible, setModalVisible] = useState(false);
    const [verificationTemplates, setVerificationTemplates] = useState([]);
    const [schema, setSchema] = useState({});
    const [did, setDid] = useState(null)
    const [issuers, setIssuers] = useState([])

    const retrieveIssuersList = async () => {
        let data = await IssuerService.getIssuerList()
        let issuerList = []
        data.forEach(element => {
          issuerList.push({
              value : element.did , label : element.name
          })
        });
        setIssuers(issuerList)
      }

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

    const retrieveVerificationTemplates = async () => {
        let data = await VerifierService.verificationTemplatesList(verifier.did)
        if(data.length > 0){
          let finalRes = [];
          data.forEach(schemaRes => {
              let name = schemaRes[0];  
              let path = schemaRes[1];
              let result = {
                name,
                path
              }
              finalRes.push(result);
          });
          return finalRes;
        }
        else {
          return []
        }
    }

    const openModal = async (item) => {
        let data = await VerifierService.resolveVerificationTemplate(verifier.did , item.name)
        let finaleSchema = {
            title : data.title,
            description : data.description,
            verifiableCredential : data.properties.verifiableCredential.items
        }
        setSchema(finaleSchema)
        setModalVisible(true) 
      };
  
    const closeModal = () => {
        setModalVisible(false)
        setSchema({})
    };
  

    const sendRequest = async () => {
        let done = await VerifierService.sendVerificationRequest(did , verifier.did, schema.title)
        if(done){
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
        retrieveVerificationTemplates().then((res) => {
            setVerificationTemplates(res);
        });
        retrieveIssuersList();
        getIdentity()
    }, [])
    
    function getIssuer(did) {
        let data = issuers.filter(issuer => issuer.value === did)
        return data[0].label
    }

    return(
        <>
        <Block flex center style={styles.cart}>
        <FlatList
            data={verificationTemplates}
            renderItem={({item}) => (
                    <Block card shadow style={styles.product}>
                        <Block row style={styles.productDescription}>
                            <Block style={{width: width*0.15}}>
                            <AntDesign name="slack" size={24} color={argonTheme.COLORS.PRIMARY} 
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
                                style={{ width: 28, height: 28 }} 
                                onPress={() => openModal(item)}>
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
            <ScrollView style={styles.centeredView}>
                <Block style={styles.modalView}>
                    {/** Start */}
                    <Block style={styles.card}>
                        <Block row>
                            <Block style={{width : width*0.7}}>
                                <Text
                                size={16}
                                style={{ fontFamily: "open-sans-bold" }}
                                color={argonTheme.COLORS.TEXT}
                                >
                                    Proof Request : {schema.title}
                                </Text>
                            </Block>
                            <Block style={{width : width*0.2}}>
                                <AntDesign name="closesquareo" size={24} color={argonTheme.COLORS.PRIMARY} 
                                onPress={closeModal}/>
                            </Block>
                        </Block>
                        <Block style={styles.cardHeader} style={{marginTop : 20}}>
                            <ViewMoreText
                              numberOfLines={2}
                              renderViewMore={renderViewMore}
                              renderViewLess={renderViewLess}
                            >
                                <Text
                                    color={argonTheme.COLORS.BLACK}
                                    size={14}
                                    style={{ fontFamily: "open-sans-regular"}}
                                >
                                    {schema.description}
                                </Text>
                            </ViewMoreText>
                        </Block>
                        <Block middle style={styles.cardHeader} style={{marginTop : 20}}>
                                <Text
                                    color={argonTheme.COLORS.BLACK}
                                    size={14}
                                    style={{ fontFamily: "open-sans-regular"}}
                                    middle
                                >
                                    This organization is requesting the  
                                </Text>
                                <Text
                                    color={argonTheme.COLORS.BLACK}
                                    size={14}
                                    style={{ fontFamily: "open-sans-regular"}}
                                    middle
                                >
                                    following informations : 
                                </Text>
                        </Block>
                        <Block middle style={styles.cardHeader} style={{margin : 15}}>
                                <Text
                                    color={argonTheme.COLORS.BLACK}
                                    size={15}
                                    style={{ fontFamily: "open-sans-regular", fontWeight: "bold"}}
                                    middle
                                >
                                    {schema?.verifiableCredential?.length} Credential(s) Included
                                </Text>
                        </Block>
                        
                        {  schema.verifiableCredential ? 
                            (schema.verifiableCredential.map((item, index) => {
                              return ( 
                                <>
                            <Block style={{backgroundColor: "white"}}>
                                <Block style={{ backgroundColor: "#d7363c",padding: 10}}>    
                                    <Block>  
                                        <Text size={14} color={argonTheme.COLORS.WHITE} style={{fontWeight: "bold"}}>
                                            Credential {index +1} :  {item.title}
                                        </Text>
                                    </Block>  
                                    <Block>  
                                        <Text size={14} style={{fontWeight: "bold"}} color={argonTheme.COLORS.WHITE}>
                                            Issuer : {getIssuer(item.issuer)}
                                        </Text>
                                    </Block>
                                </Block>
                            </Block>
                            <Block style={{backgroundColor: "white", marginBottom: 10}}>
                                <Block style={{ borderColor: "#d7363c",
        borderStyle: "solid",
        borderWidth: 5,padding: 10}}>  
                                {  item.properties.credentialSubject.properties ? 
                                    ( Object.entries(item.properties.credentialSubject.properties).map((element, index) => {                                      
                                        return (
                                        <Block  space="between" key={index}>
                                            <Block>
                                                <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.BLACK}>
                                                {element[0]}
                                                </Text>
                                            </Block>
                                            <Block >
                                                <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.MUTED}>
                                                {element[1].description}
                                                </Text>
                                            </Block>
                                        </Block>    
                                        );
                                    }))
                                : null} 
                                </Block>
                            </Block>
                            </>
                             );
                            }))
                        : null}
                        
                        <Block  middle style={{ margin: 5  }}>
                        <Button style={styles.button} onPress={sendRequest}>
                            <Text style={{ fontFamily: 'open-sans-bold', color: "white" }}>
                                Send Request
                            </Text>
                        </Button>
                    </Block>
                    </Block>
                    {/** End */}
                </Block>
            </ScrollView>
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
        //justifyContent: "center",
        //alignItems: "center",
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
    },
    imageContainer: {
        width: width*0.2, 
        alignItems: 'center',
        height: 85,
        //backgroundColor: argonTheme.COLORS.WHITE,
        /* borderColor: "#d7363c",
        borderStyle: "solid",
        borderWidth: 5 */
    },
    rightSideModal : {
        width: width*0.8, 
        padding: 15,
        height: 85
    }
});

export default VerifierServices;
