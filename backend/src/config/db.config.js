const mysql = require("mysql");
const config = require("./config.js");
const multer = require('multer')
const path = require('path')
const cors = require("cors");
const bodyParser = require('body-parser');

// Create a connection to the database
const connection = mysql.createConnection({
  host: config.HOST,
  user: config.USER,
  password: config.PASSWORD,
  database: config.DB
});

// open the MySQL connection
connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});


module.exports = connection;