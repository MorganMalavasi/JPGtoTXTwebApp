const express = require('express');
const path = require('path');
const tesseract = require('tesseract.js');
const bodyParser = require('body-parser');
const multer = require('multer');
const ejs = require('ejs');
const fs = require('fs');

// set storage engine 
const storage = multer.diskStorage({
    destination: './public/', 
    filename: function(req, file, cb){
        cb(null,file.fieldname + '-' + Date.now() + 
        path.extname(file.originalname));
    }
});

// Init Upload 
// set limit and extension 
const upload = multer({
    storage: storage,
    limits:{fileSize: 5000000},
    fileFilter: function(req, file, cb){
        checkFileType(file,cb);
    }
}).single('myImage');

function checkFileType(file,cb){
    // check extension 
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // check mimetype 
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype)
        return cb(null, true);
    else 
        return cb('error: Images only');
}

// tesseract engine
const { TesseractWorker } = tesseract;
const worker = new TesseractWorker();

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(bodyParser.json());

// GET METHODS
// TODO: sostituire il ridirezionamento della pagina con quella vera 
app.get('/', (req,res) => {
    res.render('start');
});

app.post('/upload', (req,res) => {
    upload(req,res,(err) => {
        if (err){
            res.render('start', {
                msg: err
            });
        } else {
            if (req.file == undefined){
                res.render('start', {
                    msg: 'Error: no File Selected'
                });
            } else {
                worker
                .recognize('./public/'+req.file.filename)
                .progress((p) => {
                    console.log('progress', p);
                })
                .then(({ text }) => {
                    res.render('start', {
                        msg: 'File Uploaded',
                        file: req.file.filename,
                        text: text
                    });
                    console.log(text)
                    worker.terminate();
                });
            }
        }
    });
});

var port = process.env.PORT || 8080;
app.listen(port);
console.log('App listening on port ' + port );