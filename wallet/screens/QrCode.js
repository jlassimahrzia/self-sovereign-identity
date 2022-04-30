import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import SqliteService from "../services/SqliteService"
export default function QrCode() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const db = SqliteService.openDatabase()
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const setDID = (db, did) =>{
    db.transaction(
      (tx) => {
        tx.executeSql("update identity set did = ? where id = 1;", 
        [did],
        (tx, resultSet) => { console.log(resultSet)},
        (tx, error) => console.log(error)
        );
      }
    );
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true)
    alert(`${data}`)
    console.log(data)
    setDID(db,data)
    SqliteService.getIdentity(db)
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission ! </Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
