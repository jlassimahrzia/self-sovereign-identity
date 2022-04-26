import * as SQLite from "expo-sqlite";

class SqliteService {

    openDatabase() {
        const db = SQLite.openDatabase("wallet.db");
        db.transaction((tx) => {
            tx.executeSql(
              "create table if not exists identity (id integer primary key not null, address text, privateKey text, publicKey text, did text);"
            );
        });
        db.transaction((tx) => {
            tx.executeSql(
              "create table if not exists profile (id integer primary key not null, firstname text, lastname text, email text, photo text);"
            );
        });
        return db;
    }

    deleteTable(db){
        db.transaction((tx) => {
            tx.executeSql(
              "drop table identity"
            );
        });
        db.transaction((tx) => {
            tx.executeSql(
              "drop table profile"
            );
        });
    }

    getIdentity(db){
        db.transaction((tx) => {
            tx.executeSql(
              `select * from identity`,
              [],(transaction, resultSet) => console.log("identity",resultSet.rows._array),
              (transaction, error) => console.log(error)
            );
        });
        db.transaction((tx) => {
            tx.executeSql(
              `select * from profile`,
              [],(transaction, resultSet) => console.log("profile",resultSet.rows._array),
              (transaction, error) => console.log(error)
            );
        });
    }
}

export default new SqliteService();