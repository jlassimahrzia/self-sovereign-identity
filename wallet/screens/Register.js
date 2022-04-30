import { useState, useEffect} from 'react'
import {
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Image, View
} from "react-native";
import { Block, Text, theme } from "galio-framework";
import { Button, Icon, Input } from "../components";
import { Images, argonTheme } from "../constants";

import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import SqliteService from "../services/SqliteService"
import DidService from '../services/DidService';

const { width, height } = Dimensions.get("screen");
const cardWidth = width - theme.SIZES.BASE * 2;

import Toast from 'react-native-toast-message';

function Register({ navigation }) {

  const db = SqliteService.openDatabase()
  const [id, setId] = useState(null)

  const [load, setLoading] = useState(false)
  const [address, setAddress] = useState(false)
  const [publicKey, setPublicKey] = useState(false)

  const [image, setImage] = useState(null);
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const getIdentity = async () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM identity', [], 
        (txObj, { rows: { _array } }) => {
          if(_array.length != 0){
            setAddress(_array[0].address)
            setPublicKey(_array[0].publicKey)}
            console.log("inside tx",address,publicKey)
        },
        (txObj, error) => console.log('Error ', error)
      ) 
    })
  }

  useEffect(() => {
    getIdentity()
  }, [setPublicKey,setAddress]);

  const RegisterSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    firstname: Yup.string().min(2, 'Too Short!').required('Required'),
    lastname: Yup.string().min(2, 'Too Short!').required('Required')
  });

  const { handleChange, handleSubmit, handleBlur, values, errors, touched } = useFormik({
    validationSchema: RegisterSchema,
    initialValues: { firstname: '', lastname: '', email: '' },
    onSubmit: async (values) =>{
      setLoading(true)

      db.transaction(tx => {
        tx.executeSql('INSERT INTO profile (firstname, lastname, email, photo) values (?,?,?,?)', 
        [values.firstname, values.lastname, values.email, image],
          (txObj, resultSet) => setId(resultSet.insertId),
          (txObj, error) => console.log('Error', error))
      })

      console.log(address,publicKey)
      if(address && publicKey){
        const res = await DidService.sendDidRequest(values.firstname, values.lastname,  values.email ,address , publicKey)  
        if(res){
          navigation.navigate("App")
          Toast.show({
            type: 'success',
            text1: 'Info',
            text2: 'Your request is being processed'
          });
          setLoading(false)
        }
        else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to send Did Request'
          });
          setLoading(false)
          SqliteService.deleteTable(db)
        }
        SqliteService.getIdentity(db)
      }
    }
  });

    return (
      <Block flex middle>
        <StatusBar hidden />
        <ImageBackground
          source={Images.RegisterBackground}
          style={{ width, height, zIndex: 1 }}
        >
          <Block safe flex middle>
            <Block style={styles.registerContainer}>
              <Block flex>
                <Block flex={0.17} middle>
                  <Text color="#8898AA" size={12}>
                    Add some information
                  </Text>
                </Block>
                <Block flex center>
                  <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior="padding"
                    enabled
                  >
                    <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Input
                        borderless
                        placeholder="Firstname"
                        iconContent={
                          <FontAwesome name="user" size={16} color={argonTheme.COLORS.ICON} 
                          style={styles.inputIcons}/>
                        }
                        onChangeText={handleChange('firstname')}
                      />
                      <Block row style={styles.passwordCheck}>
                        <Text size={12} color={argonTheme.COLORS.MUTED}>
                          {errors.firstname && touched.firstname ?  errors.firstname : null }
                        </Text>
                      </Block>
                    </Block>
                    <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Input
                        borderless
                        placeholder="Lastname"
                        iconContent={
                          <FontAwesome name="user" size={16} color={argonTheme.COLORS.ICON} 
                          style={styles.inputIcons}/>
                        }
                        onChangeText={handleChange('lastname')}
                      />
                      <Block row style={styles.passwordCheck}>
                        <Text size={12} color={argonTheme.COLORS.MUTED}>
                          {errors.lastname && touched.lastname ?  errors.lastname : null }
                        </Text>
                      </Block>
                    </Block>
                    <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Input
                        borderless
                        placeholder="Email"
                        iconContent={
                          <MaterialIcons name="email" size={16} color={argonTheme.COLORS.ICON} 
                          style={styles.inputIcons} />
                        }
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        error={errors.email}
                        touched={touched.email}
                      />
                      <Block row style={styles.passwordCheck}>
                        <Text size={12} color={argonTheme.COLORS.MUTED}>
                          {errors.email && touched.email ?  errors.email : null }
                        </Text>
                      </Block>
                    </Block>
                    <Block center width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Button
                        color="secondary"
                        textStyle={{ color: "black", fontSize: 12, fontWeight: "700" }}
                        style={styles.button}
                        onPress={pickImage}
                        icon="upload" iconFamily="antdesign" iconSize={16} iconColor={argonTheme.COLORS.ICON}
                      >
                        Upload photo
                      </Button>
                      <Block>
                        {image && <Image source={{ uri: image }} style={styles.imageStyle} />}
                      </Block>
                    </Block>
                    <Block middle>
                      <Button color="primary" style={styles.createButton} onPress={handleSubmit} 
                      loading={load}
                      loadingSize="large">
                        <Text bold size={16} color={argonTheme.COLORS.WHITE}>
                          Register 
                        </Text>
                      </Button>
                    </Block>
                  </KeyboardAvoidingView>
                </Block>
              </Block>
            </Block>
          </Block>
        </ImageBackground>
      </Block>
    );
}

const styles = StyleSheet.create({
  registerContainer: {
    width: width * 0.9,
    height: height * 0.850,
    backgroundColor: "#F4F5F7",
    borderRadius: 4,
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
    overflow: "hidden"
  },
  inputIcons: {
    marginRight: 12
  },
  createButton: {
    width: width * 0.5,
    marginTop: 25
  },
  button: {
    marginBottom: theme.SIZES.BASE,
    width: width * 0.8,
  },
  imageStyle: {
    width: 100,
    height: 100, 
    borderRadius: 4,
  },
  passwordCheck: {
    paddingLeft: 15,
  },
});

export default Register;
