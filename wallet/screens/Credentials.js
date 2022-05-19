
import { Block, Text, theme } from "galio-framework";
import {
    StyleSheet, Dimensions, Image, Modal, TouchableWithoutFeedback, TouchableOpacity
} from "react-native";
import { argonTheme, Images } from "../constants";
import { Button } from "../components/";
import { AntDesign } from '@expo/vector-icons';
import { useState } from "react";
const { width } = Dimensions.get("screen");
function Credentials() {
    const [modalVisible, setModalVisible] = useState(false);
    const openModal = () => {
        setModalVisible(true)
    };

    const closeModal = () => {
        setModalVisible(false)
    };
    return(
        <>
        <Block flex center style={styles.cart}>
                <TouchableWithoutFeedback onPress={openModal}>
                    <Block card shadow style={styles.product}>
                        <Block row>
                            <Block style={{width: width*0.2, alignItems: 'center'}} >
                                <Image
                                    source={Images.logoEnsi}
                                    style={styles.image}
                                    resizeMode="contain"
                                />
                            </Block>
                            <Block style={styles.rightSide}>
                                <Text size={16} style={styles.productTitle} color={argonTheme.COLORS.BLACK}
                                    style={{fontWeight: "bold"}}>
                                    Diplome
                                </Text>
                                <Text size={14} muted style={{marginVertical: 5}}>
                                    Ecole Nationale des Sciences de l'Informatique
                                </Text>
                            </Block>
                        </Block>
                    </Block>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={openModal}>
                    <Block card shadow style={styles.product}>
                        <Block row>
                            <Block style={{width: width*0.2, alignItems: 'center'}} >
                                <Image
                                    source={Images.logoMunicipalite}
                                    style={styles.image}
                                    resizeMode="contain"
                                />
                            </Block>
                            <Block style={styles.rightSide}>
                                <Text size={16} style={styles.productTitle} color={argonTheme.COLORS.BLACK}
                                    style={{fontWeight: "bold"}}>
                                    Extrait de naissance
                                </Text>
                                <Text size={14} muted style={{marginVertical: 5}}>
                                    Municipalite de Tunis
                                </Text>
                            </Block>
                        </Block>
                    </Block>
                </TouchableWithoutFeedback>
        </Block>
        <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={closeModal}
        >
            <TouchableOpacity style={styles.centeredView} onPress={closeModal}>
                <Block style={styles.modalView}>
                        <Block style={styles.cardHeader}>                           
                            <Block row>
                                <Block style={styles.imageContainer}>
                                    <Image
                                        source={Images.logoEnsi}
                                        style={styles.imageModal}
                                        resizeMode= 'contain'
                                    />
                                </Block>
                                <Block row style={styles.rightSideModal}>
                                    <Block >
                                    <Text size={16} style={styles.productTitle} color={argonTheme.COLORS.WHITE}
                                        style={{fontWeight: "bold"}}>
                                        Diplome
                                    </Text>
                                    <Text size={14} style={{marginVertical: 5}} color={argonTheme.COLORS.WHITE}>
                                        Ecole Nationale des Sciences de l'Informatique
                                    </Text>
                                    </Block>
                                    {/* <Block>
                                        <AntDesign name="closesquareo" size={24} color={argonTheme.COLORS.WHITE} 
                                        onPress={closeModal}/>
                                    </Block> */} 
                                </Block>
                            </Block>
                        </Block>
                        <Block>
                            <Block row space="between" style={styles.cardBody}>
                                <Block>
                                    <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.TEXT}>Name</Text>
                                </Block>
                                <Block >
                                    <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.MUTED}>Jlassi Mahrzia</Text>
                                </Block>
                            </Block>
                            <Block row space="between" style={styles.cardBody}>
                                <Block>
                                    <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.TEXT}>Program Name</Text>
                                </Block>
                                <Block >
                                    <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.MUTED}>Computer Science Engineer</Text>
                                </Block>
                            </Block>
                            <Block row space="between" style={styles.cardBody}>
                                <Block>
                                    <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.TEXT}>Graduation Year</Text>
                                </Block>
                                <Block >
                                    <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.MUTED}>2022</Text>
                                </Block>
                            </Block>
                            <Block row space="between" style={styles.cardBody}>
                                <Block>
                                    <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.TEXT}>Final Grades</Text>
                                </Block>
                                <Block >
                                    <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color={argonTheme.COLORS.MUTED}>B+</Text>
                                </Block>
                            </Block>
                        </Block>
                </Block>
            </TouchableOpacity>
        </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    cart: {
        width: width,
        marginTop: 15
    },
    productTitle: {
      fontFamily: 'open-sans-bold',
      flex: 1,
      flexWrap: "wrap",
      paddingBottom: 6
    },
    product: {
        width: width * 0.95,
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
        borderLeftWidth: 1,
        height: 85
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 50,
        margin: 16,
        overflow: 'hidden'
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginTop: 22
    },
    modalView: {
        //margin: 20,
        backgroundColor: "white",
        //borderRadius: 20,
        //padding: 20,
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
        width: 280
    },
    cardHeader: {
        width: 320,
        backgroundColor: argonTheme.COLORS.DEFAULT,
        marginBottom: 10,
        paddingBottom: 5
    },
    rightSideModal : {
        width: width*0.8, 
        padding: 15,
        height: 85
    },
    imageModal: {
        width: 50,
        height: 50,
        margin: 16
    },
    imageContainer: {
        width: width*0.2, 
        alignItems: 'center',
        height: 85,
        backgroundColor: argonTheme.COLORS.WHITE,
        borderColor: "#d7363c",
        borderStyle: "solid",
        borderWidth: 5,
    },
    cardBody: {
        width: 320,
        backgroundColor: argonTheme.COLORS.WHITE,
        padding: 10
    }
})
export default Credentials;