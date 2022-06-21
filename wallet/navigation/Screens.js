import { Animated, Dimensions, Easing } from "react-native";
import {useEffect, useState} from 'react'
// header for screens
import { Header, Icon } from "../components";
import { argonTheme } from "../constants";

import { Block } from "galio-framework";
// drawer
import CustomDrawerContent from "./Menu";

// screens
import Home from "../screens/Home";
import Onboarding from "../screens/Onboarding";
import Credentials from "../screens/Credentials";
import Organisations from "../screens/Organisations";
import Profile from "../screens/Profile";
import Settings from "../screens/Settings";
import QrCode from "../screens/QrCode";
import Register from "../screens/Register";
import Verifiers from "../screens/Verifiers";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import OrgCredentials from "../screens/OrgCredentials";
import Search from "../screens/Search";

import SqliteService from "../services/SqliteService"
import CredSearch from "../components/CredSearch";
import VerifierServices from "../screens/VerifierServices";

const { width } = Dimensions.get("screen");

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const category = [
  { id: '1', title: 'Category 1' },
  { id: '2', title: 'Category 2' },
  { id: '3', title: 'Category 3' }
]

function QrCodeStack(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
    >
      <Stack.Screen
        name="QrCode"
        component={QrCode}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="QrCode"
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
    </Stack.Navigator>
  );
}

function OrganisationsStack(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
    >
      <Stack.Screen
        name="Organisations"
        component={Organisations}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Organisations"
              search
              tabs={category}
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
      <Stack.Screen
        name="Credentials"
        component={OrgCredentials}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Credentials"
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" }
        }}
      />
      <Stack.Screen
        name="Search"
        component={Search}
        options={{
          header: ({ navigation, scene }) => (
            <Header title="Search" back navigation={navigation} scene={scene} />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" }
        }}
      />
    </Stack.Navigator>
  );
}

function VerifiersStack(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
    >
      <Stack.Screen
        name="Verifiers"
        component={Verifiers}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Verifiers"
              search
              tabs={category}
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
      <Stack.Screen
        name="Services"
        component={VerifierServices}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Services"
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" }
        }}
      />
      {/* <Stack.Screen
        name="Search"
        component={Search}
        options={{
          header: ({ navigation, scene }) => (
            <Header title="Search" back navigation={navigation} scene={scene} />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" }
        }}
      /> */}
    </Stack.Navigator>
  );
}

function ProfileStack(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
    >
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Profile"
              navigation={navigation}
              scene={scene}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
    >
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Settings"
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
    </Stack.Navigator>
  );
}

function CredentialsStack(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
    >
      <Stack.Screen
        name="Verifiable Credentials"
        component={Credentials}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Verifiable Credentials"
              credsearch
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
      <Stack.Screen
        name="CredSearch"
        component={CredSearch}
        options={{
          header: ({ navigation, scene }) => (
            <Header title="Search" back navigation={navigation} scene={scene} />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" }
        }}
      />
    </Stack.Navigator>
  );
}

function HomeStack(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
    >
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Home"
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
    </Stack.Navigator>
  );
}

export default function OnboardingStack(props) {
  const db = SqliteService.openDatabase()
  const [identity, setIdentity] = useState("")
  const [profile, setProfile] = useState("")

  const getIdentity = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `select * from identity`,
        [],(transaction, resultSet) => { 
          if(resultSet.rows.length != 0)
          setIdentity(resultSet.rows._array[0])},
        (transaction, error) => console.log(error)
      );
    });
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
    getIdentity()
    console.log("identiy",identity);
    console.log("profile",profile);
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: false,
      }}
    >
      { identity === "" ? <Stack.Screen
        name="Onboarding"
        component={Onboarding}
        option={{
          headerTransparent: true,
        }}
      /> : null}
      { profile === "" ? <Stack.Screen name="Register" component={Register} /> : null}
      <Stack.Screen name="App" component={AppStack} /> 
    </Stack.Navigator>
  );

}

function AppStack(props) {
  const db = SqliteService.openDatabase()
  const [did, setDid] = useState(null)

  const getIdentity = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `select * from identity`,
        [],(transaction, resultSet) =>{ 
          if(resultSet.rows.length != 0)
            setDid(resultSet.rows._array[0].did)},
        (transaction, error) => console.log(error)
      );
    });
  }

  useEffect(() => {
    getIdentity()
    console.log("from appstack", did)
  }, []);

  return (
    <Drawer.Navigator
      style={{ flex: 1 }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      drawerStyle={{
        backgroundColor: "white",
        width: width * 0.8,
      }}
      drawerContentOptions={{
        activeTintcolor: "white",
        inactiveTintColor: "#000",
        activeBackgroundColor: "transparent",
        itemStyle: {
          width: width * 0.75,
          backgroundColor: "transparent",
          paddingVertical: 16,
          paddingHorizonal: 12,
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
          overflow: "hidden",
        },
        labelStyle: {
          fontSize: 18,
          marginLeft: 12,
          fontWeight: "normal",
        },
      }}
      initialRouteName="Home"
    >
      <Drawer.Screen name="Home" component={HomeStack} />
      <Drawer.Screen name="QR-Code" component={QrCodeStack} />
      <Drawer.Screen name="Profile" component={ProfileStack} />
      { did ? <Drawer.Screen name="Credentials" component={CredentialsStack} /> : null }
      { did ? <Drawer.Screen name="Organisations" component={OrganisationsStack} /> : null }
      { did ? <Drawer.Screen name="Verifiers" component={VerifiersStack} /> : null }
      <Drawer.Screen name="Settings" component={SettingsStack} />
    </Drawer.Navigator>
  );
}
