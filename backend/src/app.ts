/** Setup Express web server **/

var express = require('express');
var app = express();
var config = require('./config/config.js');
let cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(require('./routes/did'));
app.use(require('./routes/vc.schema'));

app.get('/', (req : any , res : any ) => {
    console.log("Hello World")
    res.send('Well done!');
})

app.listen(config.PORT, () => 
    console.log('Listening on port ' + config.PORT)
);

app.get('/test', (req: any, res: any) => {
    let x= 0;
    x++;
    res.json({x})
})