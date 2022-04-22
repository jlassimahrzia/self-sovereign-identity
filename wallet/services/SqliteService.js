import * as SQLite from "expo-sqlite";

class SqliteService {
    
    openDatabase() {
        const db = SQLite.openDatabase("wallet.db");
        return db;
    }

    createIdentityTable(db){
        db.transaction((tx) => {
            tx.executeSql(
              "create table if not exists identity (id integer primary key not null, address text, privateKey text, publicKey text, did text);"
            );
        });
    }

    deleteTable(db){
        db.transaction((tx) => {
            tx.executeSql(
              "drop table identity"
            );
        });
    }

    getIdentity(db){
        db.transaction((tx) => {
            tx.executeSql(
              `select * from identity`,
              [],(transaction, resultSet) => console.log(resultSet.rows._array),
              (transaction, error) => console.log(error)
            );
        });
    }
}

export default new SqliteService();