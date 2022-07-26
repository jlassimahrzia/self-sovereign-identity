import {React, useState, useEffect} from "react";
import { Dimensions , StyleSheet, Image} from 'react-native';
import { Block, Text, theme, Button} from "galio-framework";
const { width } = Dimensions.get('screen');

function TrusteesRequest() {

    return(
        <Block>
            <Text>Trustees Request</Text>
        </Block>
    )
}

export default TrusteesRequest;