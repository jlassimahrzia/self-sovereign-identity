var express = require('express');
var app = express();
var config = require('../config.js');
const router = express.Router()
let cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(require('./routes/did'));

app.get('/', (req : any , res : any ) => {
    console.log("Hello World")
    res.send('Well done!');
})

app.listen(config.PORT, () => 
    console.log('Listening on port ' + config.PORT)
);