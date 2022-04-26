import {React, useEffect, useState} from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  ImageBackground,
  Platform
} from "react-native";
import { Block, Text, theme } from "galio-framework";

import { Button } from "../components";
import { Images, argonTheme } from "../constants";
import { HeaderHeight } from "../constants/utils";

import SqliteService from "../services/SqliteService"

const { width, height } = Dimensions.get("screen");

function Profile() {

  const db = SqliteService.openDatabase()
  const [profile, setProfile] = useState({})

  const getProfile = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `select * from profile`,
        [],(transaction, resultSet) => { 
          if(resultSet.rows.length != 0)
          setProfile(resultSet.rows._array[0])},
        (transaction, error) => console.log(error)
      );
    });
  }

  useEffect(() => {
    getProfile()
    console.log(profile)
  }, []);

    return (
        <Block flex>
          <ImageBackground
            source={Images.ProfileBackground}
            style={styles.profileContainer}
            imageStyle={styles.profileBackground}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ width, marginTop: '25%' }}
            >
              <Block flex style={styles.profileCard}>
                <Block middle>
                  <Image
                    source={{ uri: profile.photo }}
                    style={styles.imageStyle}
                  />
                </Block>
                <Block style={styles.info}>
                  <Block
                    middle
                    row
                    space="evenly"
                    style={{ marginTop: 20, paddingBottom: 24 }}
                  >
                    <Button
                      color="primary"
                    >
                      EDIT
                    </Button>
                  </Block>
                </Block>
                <Block flex>
                  <Block middle style={styles.nameInfo}>
                    <Text bold size={28} color="#32325D">
                     {profile.firstname} {profile.lastname} 
                    </Text>
                    <Text size={16} color="#32325D" style={{ marginTop: 10 }}>
                     {profile.email}
                    </Text>
                  </Block>
                </Block>
              </Block>
            </ScrollView>
          </ImageBackground>
        </Block>
    );
}

const styles = StyleSheet.create({
  profile: {
    marginTop: Platform.OS === "android" ? - HeaderHeight : 0,
    // marginBottom: -HeaderHeight * 2,
    flex: 1
  },
  profileContainer: {
    width: width,
    height: height,
    padding: 0,
    zIndex: 1
  },
  profileBackground: {
    width: width,
    height: height / 2
  },
  profileCard: {
    // position: "relative",
    padding: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    //marginTop: 65,
    borderRadius: 6,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    zIndex: 2
  },
  info: {
    paddingHorizontal: 40
  },
  avatarContainer: {
    position: "relative",
    marginTop: -80
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
  imageStyle: {
    width: 200,
    height: 200, 
    borderRadius: 4,
  }
});

export default Profile;
