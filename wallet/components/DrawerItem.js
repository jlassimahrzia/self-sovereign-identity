import React from "react";
import { StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Block, Text, theme } from "galio-framework";

import argonTheme from "../constants/Theme";

import { Octicons , AntDesign } from '@expo/vector-icons'; 

class DrawerItem extends React.Component {
  renderIcon = () => {
    const { title, focused } = this.props;

    switch (title) {
      case "Home":
        return (
          <AntDesign name="home" size={20} 
          color={focused ? "white" : argonTheme.COLORS.PRIMARY}/>
        );
      case "Profile":
        return (
          <AntDesign name="user" size={20} 
          color={focused ? "white" : argonTheme.COLORS.PRIMARY} />
        );
      case "QR-Code":
        return (
          <AntDesign name="scan1" size={20} 
          color={focused ? "white" : argonTheme.COLORS.PRIMARY} />
        );
      case "Credentials":
        return (
          <AntDesign name="creditcard" size={20} 
          color={focused ? "white" : argonTheme.COLORS.PRIMARY} />
        );
      case "Organisations":
        return (
          <Octicons name="link" size={20} 
          color={focused ? "white" : argonTheme.COLORS.PRIMARY} />
        );
      case "Settings":
        return (
          <AntDesign name="setting" size={20} 
          color={focused ? "white" : argonTheme.COLORS.PRIMARY} />
        );
      case "Log out":
        return <Icon />;
      default:
        return null;
    }
  };

  render() {
    const { focused, title, navigation } = this.props;

    const containerStyles = [
      styles.defaultStyle,
      focused ? [styles.activeStyle, styles.shadow] : null
    ];

    return (
      <TouchableOpacity
        style={{ height: 60 }}
        onPress={() =>
          title == "Getting Started"
            ? Linking.openURL(
                "https://demos.creative-tim.com/argon-pro-react-native/docs/"
              ).catch(err => console.error("An error occurred", err))
            : navigation.navigate(title)
        }
      >
        <Block flex row style={containerStyles}>
          <Block middle flex={0.1} style={{ marginRight: 5 }}>
            {this.renderIcon()}
          </Block>
          <Block row center flex={0.9}>
            <Text
              size={15}
              bold={focused ? true : false}
              color={focused ? "white" : "rgba(0,0,0,0.5)"}
            >
              {title}
            </Text>
          </Block>
        </Block>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  defaultStyle: {
    paddingVertical: 16,
    paddingHorizontal: 16
  },
  activeStyle: {
    backgroundColor: argonTheme.COLORS.ACTIVE,
    borderRadius: 4
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 8,
    shadowOpacity: 0.1
  }
});

export default DrawerItem;