import { Block , Text, theme} from "galio-framework";
const { width } = Dimensions.get("screen");
import {
    StyleSheet, Dimensions, Image, FlatList, RefreshControl
} from "react-native";
import { Icon } from "../components";
import { argonTheme, Images } from "../constants";
import VcService from "../services/VcService";
import IssuerService from "../services/IssuerService";
import { useState, useEffect } from "react";
import SqliteService from "../services/SqliteService";
import { environment } from '../constants/env';

function VcRequest() {
    const db = SqliteService.openDatabase()
    const [vcrequestList, setvcrequestList] = useState([])
    const [organisations, setOrganisations] = useState([])
    const [did, setDid] = useState(null)

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true)
        getIdentity()
        retrieveVcRequestList()
        retrieveIssuersList()
        setRefreshing(false)
    };

    const retrieveIssuersList = async () => {
        let data = await IssuerService.getIssuerList()
        setOrganisations(data)
    }

    const retrieveVcRequestList = async () => {
        let list = await VcService.getVCRequestList(did)
        setvcrequestList(list)
    }

    const getIssuerLogo = (did) => {
        const result = organisations.filter(item => item.did === did);
        return result[0].logo
    }

    const getIssuerName = (did) => {
        const result = organisations.filter(item => item.did === did);
        return result[0].name
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

    renderEmpty = () => {
        return <Text style={{ fontFamily: 'open-sans-regular' }} color={argonTheme.COLORS.ERROR}>The cart is empty</Text>;
    }

    useEffect(() => {
        getIdentity()
        retrieveVcRequestList()
        retrieveIssuersList()
    }, [])

    return(
        <>
            <Block flex center style={styles.cart}>
            {vcrequestList ?
                <FlatList
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    data={vcrequestList}
                    renderItem={({item}) => (
                        <Block>
                            <Block card shadow style={styles.product}>
                                <Block row>
                                    <Block style={{width: width*0.2, alignItems: 'center'}} >
                                        <Image
                                            source={{uri: `${environment.SERVER_API_URL}/image/` + getIssuerLogo(item.did_issuer) }} 
                                            style={styles.image}
                                            resizeMode="contain"
                                        />
                                    </Block>
                                    <Block style={styles.rightSide}>
                                        <Text size={16} style={styles.productTitle} color={argonTheme.COLORS.BLACK}
                                            style={{fontWeight: "bold", paddingLeft: 5}}>
                                            {getIssuerName(item.did_issuer)}
                                        </Text>
                                        <Text size={14} muted style={{marginVertical: 5, paddingLeft: 5}}>
                                            {item.vc_name}
                                        </Text>
                                        <Block row space="between" style={{paddingLeft: 5}}>
                                            <Block bottom>
                                                {item.state === 1 ?<Text
                                                    style={{ fontFamily: 'open-sans-regular' }}
                                                    style={{width : width*0.49}}
                                                    color={argonTheme.COLORS.ACTIVE}
                                                >
                                                    <Icon
                                                        family="material-community"
                                                        name="calendar-blank-outline"
                                                        size={14}
                                                        color={argonTheme.COLORS.PRIMARY}
                                                    />
                                                    <Text
                                                        color={argonTheme.COLORS.MUTED}
                                                        style={{
                                                            fontFamily: "open-sans-regular",
                                                            marginLeft: 3,
                                                            marginTop: -3
                                                        }}
                                                        size={14}
                                                    >
                                                        {item.request_date.substring(0,10)}
                                                    </Text>
                                                </Text> : 
                                                <Text
                                                style={{ fontFamily: 'open-sans-regular' }}
                                                style={{width : width*0.46}}
                                                color={argonTheme.COLORS.ACTIVE}
                                            >
                                                <Icon
                                                    family="material-community"
                                                    name="calendar-blank-outline"
                                                    size={14}
                                                    color={argonTheme.COLORS.PRIMARY}
                                                />
                                                <Text
                                                    color={argonTheme.COLORS.MUTED}
                                                    style={{
                                                        fontFamily: "open-sans-regular",
                                                        marginLeft: 3,
                                                        marginTop: -3
                                                    }}
                                                    size={14}
                                                >
                                                    {item.request_date.substring(0,10)}
                                                </Text>
                                            </Text>}
                                            </Block>
                                            <Block bottom>
                                                {item.state === 1 ? <Text
                                                    style={{ fontFamily: 'open-sans-regular' }}
                                                    style={{width : width*0.4}}
                                                    color={argonTheme.COLORS.SUCCESS}
                                                >
                                                    Issued
                                                </Text> : null}
                                                {item.state === 0 ? <Text
                                                    style={{ fontFamily: 'open-sans-regular' }}
                                                    style={{width : width*0.4}}
                                                    color={argonTheme.COLORS.WARNING}
                                                >
                                                    Pending
                                                </Text> : null}
                                                {item.state === 2 ? <Text
                                                    style={{ fontFamily: 'open-sans-regular' }}
                                                    style={{width : width*0.4}}
                                                    color={argonTheme.COLORS.PRIMARY}
                                                >
                                                    Declined
                                                </Text> : null}
                                            </Block>
                                        </Block>
                                    </Block>
                                </Block>
                            </Block>
                    </Block>
                )}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => `${index}-${item.id}`}
                ListEmptyComponent={renderEmpty}
            /> : null} 
            </Block>
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
        width: width * 0.90,
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
        borderLeftWidth: 1
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 50,
        overflow: 'hidden',
        margin : 30
    },
})
export default VcRequest;