var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require("fs");


var storage = multer.diskStorage({ //multers disk storage settings
    destination: function(req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function(req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});

var upload = multer({ //multer settings
    storage: storage
}).single('file');

router.post('/save', (req, res, next) => {
    upload(req, res, function() {
        res.json(req.file.filename);
    });
});

router.post('/base64', function(req, res, next) {
    var name = req.body.name;
    var img = req.body.image;

    var realFile = Buffer.from(img, "base64");
    
    fs.writeFile('./images/' + name, realFile, function(err) {
        if (err)
            console.log(err);
    });

    res.json({
        message: 'success',
        name: name
    });
});


module.exports = router;