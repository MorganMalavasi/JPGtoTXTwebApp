const express = require('express');
const upload = require('express-fileupload');
const path = require('path');
const okrabyte = require('okrabyte');
const fs = require("fs");
const tesseract = require('tesseract.js');

const { TesseractWorker } = tesseract;
const worker = new TesseractWorker();

var app = express();
app.use(upload());


// GET MOTHODS
// TODO: sostituire il ridirezionamento della pagina con quella vera 
app.get('/', (req,res) => {
    res.sendFile('/Users/morgan/Desktop/JPGtoTXTwebApp/start.html');
});


// POST METHODS
app.post('/upload', (req, res) => {
    if (req.files){
        console.log(req.files);
        // get extension if the file
        let file = req.files.filename;
        let extension = path.extname(file.name);
        // if the file is an IMAGE (.jpg || .jpeg || .png) then is accepted
        // while if it is a different file return 
        let extensionLowerCase = extension.toLowerCase();
        if (extensionLowerCase === '.jpg' || extensionLowerCase === '.jpeg'){
            // code for the image
            worker
                .recognize('./images/hello_world.png')
                .progress((p) => {
                    console.log('progress', p);
                })
                .then(({ text }) => {
                    console.log(text);
                    worker.terminate();
                });
        } else {
            // throw exception is not an image     
        }
        
        res.sendStatus(200);
    }
});


var port = process.env.PORT || 8080;
app.listen(port);
console.log('App listening on port ' + port );