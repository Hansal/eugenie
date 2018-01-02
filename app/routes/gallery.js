var express = require('express');
var router = express.Router();
var image = require('../models/images');

/* GET users listing. */
router.get('/', function(req, res, next) {
    image.getImages((err, results) => {
            if(err){
                console.log(err);
                res.render('gallery', { message: 'Error in getting data', error: err });
                return;
            }
            console.log(results);
            res.render('gallery', { title: 'Gallery', imagesData: results });
    });

});

module.exports = router;
