import {React, useState, useEffect} from "react";
import {
    Dimensions,
    StyleSheet,
    Image,
    Modal,
    TouchableOpacity,
    TextInput
} from 'react-native';
import {
    Block,
    Text,
    theme,
    Button,
    Input
} from "galio-framework";
import Images from "../constants/Images";
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as SQLite from 'expo-sqlite';
import CryptoES from "crypto-es";
import {Buffer} from "buffer";
import CryptoJS, {algo} from 'crypto-js'
import {Entypo} from '@expo/vector-icons';
import {Icon} from "../components/Icon";
const {width, height} = Dimensions.get('screen');
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import * as Crpyt from '../services/CryptService';


function Backup() {
    const [modalVisible, setModalVisible] = useState(false);
    const [copied, setcopied] = useState(false)

    const copyToClipboard = async () => {
        await Clipboard.setString('Hello')
        setcopied(true)
    };

    const openModal = () => {
        setModalVisible(true)
    };

    const closeModal = () => {
        setModalVisible(false)
    };
    const [modalVisible1, setModalVisible1] = useState(false);
    const openModal1 = () => {
        setModalVisible1(true)
    };

    const closeModal1 = () => {
        setModalVisible1(false)
    };
    const exportDB = async () => {

        await Sharing.shareAsync(FileSystem.documentDirectory + 'SQLite/wallet.db', {dialogTitle: 'share or copy your DB via'}).catch(error => { // console.log(error);
        })
    }

    const importDB = async () => {

        const localdb = `${
            FileSystem.documentDirectory
        }SQLite/wallet.db`
        const result = await DocumentPicker.getDocumentAsync();
        // console.log({result});
        const copyResult = await FileSystem.copyAsync({from: result.uri, to: localdb});

        let db = SQLite.openDatabase(localdb);
        // console.log(db);
    }


    const key = CryptoES.enc.Utf8.parse("Hello world!");
    const iv = CryptoES.enc.Utf8.parse("ABCDEF1234123412");


    function Decrypt(word, key) {
        const encryptedHexStr = CryptoES.enc.Hex.parse(word);
        const srcs = CryptoES.enc.Base64.stringify(encryptedHexStr);
        const decrypt = CryptoES.AES.decrypt(srcs, CryptoES.enc.Utf8.parse(key), {
            iv,
            mode: CryptoES.mode.CBC,
            padding: CryptoES.pad.Pkcs7
        });
        const decryptedStr = decrypt.toString(CryptoES.enc.Utf8);
        return decryptedStr.toString();
    }


    function Encrypt(word, key) {
        const srcs = CryptoES.enc.Utf8.parse(word);
        const encrypted = CryptoES.AES.encrypt(srcs, CryptoES.enc.Utf8.parse(key), {
            iv,
            mode: CryptoES.mode.CBC,
            padding: CryptoES.pad.Pkcs7
        });
        return encrypted.ciphertext.toString().toUpperCase();
    }


    const exportDB2 = async () => {

        let content = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + 'SQLite/wallet.db', {encoding: FileSystem.EncodingType.Base64}).then(async res => {


            let encryptedRes = Encrypt(res, "123456789")


            await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + 'SQLite/encwallet.db', encryptedRes, {encoding: FileSystem.EncodingType.Base64}).then(async () => {
                await Sharing.shareAsync(FileSystem.documentDirectory + 'SQLite/encwallet.db', {dialogTitle: 'share or copy your DB via'}).catch(error => { // console.log(error);
                })
            });


        });


    }


    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const Base64 = {
        btoa: (input : string = '') => {
            let str = input;
            let output = '';

            for (let block = 0, charCode, i = 0, map = chars; str.charAt(i | 0) || (map = '=', i % 1); output += map.charAt(63 & block >> 8 - i % 1 * 8)) {

                charCode = str.charCodeAt(i += 3 / 4);

                if (charCode > 0xFF) {
                    throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
                }

                block = block << 8 | charCode;
            }

            return output;
        },

        atob: (input : string = '') => {
            let str = input.replace(/=+$/, '');
            let output = '';

            if (str.length % 4 == 1) {
                throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
            }
            for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++); ~ buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc ++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
                buffer = chars.indexOf(buffer);
            }

            return output;
        }
    };


    const importDB2 = async () => {
        const result = await DocumentPicker.getDocumentAsync();

        let content = await FileSystem.readAsStringAsync(result.uri, {encoding: FileSystem.EncodingType.Base64}).then(async res => {


            decryptedRes = Decrypt(res, "123456789");
            decryptedAtob = Base64.atob(decryptedRes);


            if (decryptedAtob.includes('SQLite')) {
                await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + 'SQLite/wallet.db', decryptedRes, {encoding: FileSystem.EncodingType.Base64}).then(async () => {
                    let db = SQLite.openDatabase(FileSystem.documentDirectory + 'SQLite/wallet.db');
                });
            } else {
                console.log("mot de passe incorrecte");
            }


        });

        //    let content = await FileSystem.readAsStringAsync(result.uri, { encoding: FileSystem.EncodingType.Base64 }).then(res => console.log(Base64.atob(res)));


    }

    const copyPhrase = () => {
        setcopied(true)
        // console.log("done");
    }


    return (
        <>
            <Button onPress={exportDB}>export</Button>
            <Button onPress={importDB}>import</Button>
            <Button onPress={exportDB2}>export2</Button>
            <Button onPress={importDB2}>import2</Button>
            {/*   <Block center
            style={
                {paddingHorizontal: theme.SIZES.BASE}
        }>
            <Block flex>
                <Block>
                    <Block style={styles.title}>
                        <Block center style={{paddingHorizontal:20}}>
                            <Text color="black" size={17}>
                                Back up your wallet to protect your information from being lost or destroyed. Backing up your account
                                stores an encrypted copy of your identityTN ID and data.
                            </Text>
                        </Block>
                        <Block center>
                            <Image source={Images.backupImage} style={styles.image}
                            resizeMode="contain"/>
                        </Block>
                        <Block>
                            <Block center>
                                <Button
                                    color="#5E72E4"
                                    textStyle={{ color: "white", fontSize: 15, fontFamily: 'open-sans-bold' }}
                                    style={styles.button}
                                    size="large"
                                    icon="arrowdown" iconFamily="antdesign" iconSize={20} iconColor="white"
                                    onPress={openModal}
                                >
                                    Backup Wallet
                                </Button>
                            </Block>
                            <Block center>
                                <Button
                                    color={theme.COLORS.DEFAULT}
                                    textStyle={{ color: "white", fontSize: 15, fontFamily: 'open-sans-bold' }}
                                    style={styles.button}
                                    size="large"
                                    icon="arrowup" iconFamily="antdesign" iconSize={20} iconColor="white"
                                    onPress={openModal1}
                                >
                                Restore Wallet
                                </Button>
                            </Block>
                        </Block>
                    </Block>
                </Block>
            </Block>
        </Block>
        <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={closeModal}
        >
            <TouchableOpacity style={styles.centeredView} onPress={closeModal}>
                <Block style={styles.modalView}>
                    <Block style={styles.card}>
                        <Block style={styles.title}>
                            <Text textStyle={{ color: "white", fontSize: 20, fontFamily: 'open-sans-bold' }} bold>
                                Write down wallet recovery phrase :
                            </Text>
                        </Block>
                        <Block>
                            <TextInput value="ready wine slim arch produce conduct trial project dirt spoon shock authorm"
                               style={styles.input} multiline 
                               numberOfLines={3} autoCorrect={false} editable={false}/>
                        </Block>
                        <Block>
                            <Button small color={theme.COLORS.DEFAULT} style={{marginTop: 0,margin: 20, width: 80}}
                            textStyle={{ color: "white" }} onPress={copyToClipboard}>Copy</Button>
                        </Block>
                        <Block style={{marginTop: 0,margin:20}}>
                        { copied && <Text
                                                    style={{ fontFamily: 'open-sans-regular' }}
                                                    style={{width : width*0.4}}
                                                    color={theme.COLORS.SUCCESS}
                                                >
                                                    Copied to clipboard
                                                </Text> }
                        </Block>
                        <Block style={{paddingTop: 0, padding:20}} >
                            <Text bold  color="#e7413b" textStyle={{ fontSize: 20, fontFamily: 'open-sans-bold' }}>
                                WHAT IS THIS?
                            </Text>
                            <Text textStyle={{ color: "white", fontSize: 15}}>
                                This phrase is used to recover your encrypted wallet in case your device is lost or destroyed.
                                This of it as an extra secure password. Write this down in a safe location whre ou will remember it.
                            </Text>
                        </Block>
                        <Block style={{ margin: 5  }}>
                            <Button style={styles.button} >
                                <Text style={{ fontFamily: 'open-sans-bold', color: "white" }}>
                                    Done
                                </Text>
                            </Button>
                        </Block>
                    </Block>
                </Block>
            </TouchableOpacity>
        </Modal>
        <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible1}
            onRequestClose={closeModal1}
        >
            <TouchableOpacity style={styles.centeredView} onPress={closeModal1}>
                <Block style={styles.modalView}>
                    <Block style={styles.card1}>
                        <Block style={styles.title}>
                            <Text textStyle={{ color: "white", fontSize: 20, fontFamily: 'open-sans-bold' }} bold>
                                Enter your wallet recovery phrase :
                            </Text>
                        </Block>
                        <Block>
                            <TextInput
                               style={styles.input} multiline
                               numberOfLines={3} autoCorrect={false}/>
                        </Block>
                        <Block style={{ margin: 5  }}>
                            <Button style={styles.button} >
                                <Text style={{ fontFamily: 'open-sans-bold', color: "white" }}>
                                    Done
                                </Text>
                            </Button>
                        </Block>
                    </Block>
                </Block>
            </TouchableOpacity>
        </Modal>  */} </>
    )
}

const styles = StyleSheet.create({
    title: {
        padding: 20
    },
    image: {
        width: width,
        height: height * 0.5
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
        height: 450
    },
    card1: {
        width: 320,
        height: 250
    },
    input: { // height: auto,
        marginTop: 0,
        margin: 20,
        borderWidth: 1,
        padding: 10
    },
    button: {
        marginBottom: theme.SIZES.BASE,
        width: width * 0.8
    }
});

export default Backup;
