var express = require('express');
var app = express();
const router = express.Router()
const db = require("../config/db.config.js");
let base64Img = require('base64-img');

const getIssuersList = () : any => {
    let query = "SELECT * FROM issuers"
    return new Promise((resolve, reject) => {
        db.query(query, (err: any, res: any) => {
            if (err) {
                console.log("error: ", err);
                reject(err);
            }
            resolve(res);
        });
    });
}

const getImage = (path: String) : any => {
    let image = `public/${path}`
    
    let imageData1 = base64Img.base64Sync(image);
    let base64Data = imageData1.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    let img = Buffer.from(base64Data, 'base64');

    return img
}

router.get('/api/issuersList', async (req : any , res : any) => {
    const list = await getIssuersList()
    res.json({list})
})

router.get('/api/image/:path', async (req : any , res : any) => {
    let path = req.params.path
    let img = getImage(path)
    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length
    });
    res.end(img);
})

module.exports = router;