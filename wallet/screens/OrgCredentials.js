
import { StyleSheet, Dimensions, FlatList, Modal } from "react-native";
import { Block, Text,theme ,Button, view} from "galio-framework";
import { Card } from "../components";
import { Icon } from "../components";
import { argonTheme } from "../constants";
import { Feather, Ionicons } from '@expo/vector-icons'; 
import { AntDesign } from '@expo/vector-icons';
import { useState } from "react";
const { width } = Dimensions.get("screen");

renderEmpty = () => {
    return <Text style={{ fontFamily: 'open-sans-regular' }} color={argonTheme.COLORS.ERROR}>The cart is empty</Text>;
}

function OrgCredentials({ route, navigation }) {
    const { org } = route.params;
    const credentials = [
        {
            id: 1,
            name:  "PersonalId Credentials"
        },
        {
            id: 2,
            name:  "PersonalId Credentials"
        },
        {
            id: 3,
            name:  "PersonalId Credentials"
        },
    ]
    const [modalVisible, setModalVisible] = useState(false);

    const toggleModal = () => {
      setModalVisible(!modalVisible);
    };

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
                                style={{ width: 28, height: 28 }} onPress={toggleModal}>
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
                onRequestClose={() => {
                Alert.alert("Modal has been closed.");
                setModalVisible(!modalVisible);
                }}
            >
            <Block style={styles.centeredView}>
                <Block style={styles.modalView}>
                    {/** Start */}
                    <Block style={styles.card}>
                        <Block flexDirection="row-reverse" style={{margin: 3}}>
                            <AntDesign name="closesquareo" size={24} color={argonTheme.COLORS.PRIMARY} 
                            onPress={() => setModalVisible(!modalVisible)}/>
                        </Block>
                        <Block style={styles.cardHeader}>
                            <Text
                            size={16}
                            style={{ fontFamily: "open-sans-bold" }}
                            color={argonTheme.COLORS.TEXT}
                            >
                            PersonalId Credentials
                            </Text>
                        </Block>
                        <Block column style={{ paddingRight: 3, paddingLeft: 12, margin: 5 }}>
                            <Block row space="between" style={{ height: 18 }}>
                                <Text color={argonTheme.COLORS.MUTED1} style={{ fontFamily: 'open-sans-bold' }} size={14}>
                                 familyName :
                                </Text>
                            </Block>
                            <Text
                                color={argonTheme.COLORS.BLACK}
                                size={14}
                                style={{ fontFamily: "open-sans-regular"}}
                            >
                                Defines current family name(s) of the credential subject
                            </Text>
                        </Block>
                        <Block column style={{ paddingRight: 3, paddingLeft: 12, margin: 5  }}>
                            <Block row space="between" style={{ height: 18 }}>
                                <Text color={argonTheme.COLORS.MUTED1} style={{ fontFamily: 'open-sans-bold' }} size={14}>
                                firstName :
                                </Text>
                            </Block>
                            <Text
                                color={argonTheme.COLORS.BLACK}
                                size={14}
                                style={{ fontFamily: "open-sans-regular"}}
                            >
                                Defines current first name(s) of the credential subject
                            </Text>
                        </Block>
                        <Block column style={{ paddingRight: 3, paddingLeft: 12, margin: 5  }}>
                            <Block row space="between" style={{ height: 18 }}>
                                <Text color={argonTheme.COLORS.MUTED1} style={{ fontFamily: 'open-sans-bold' }} size={14}>
                                dateOfBirth :
                                </Text>
                            </Block>
                            <Text
                                color={argonTheme.COLORS.BLACK}
                                size={14}
                                style={{ fontFamily: "open-sans-regular"}}
                            >
                               Defines date of birth of the credential subject
                            </Text>
                        </Block>
                        <Block style={{ margin: 5  }}>
                        <Button style={styles.button}>
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
        width: '100%',
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
