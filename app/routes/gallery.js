var express = require('express');
var router = express.Router();
var image = require('../models/images');

/* GET images listing. */
router.get('/', function(req, res, next) {
    const imageID = req.query.imageID || null;
    let openImage = {};
    image.getImages((err, results) => {
            if(err){
                console.log(err);
                res.render('gallery', { message: 'Error in getting data', error: err });
                return;
            }

            if(imageID){
                openImage = results.filter((obj) => {
                    return obj.ID == imageID
                })[0];
            }

            res.render('gallery', { title: 'Gallery', imagesData: results, openImage });


    });
});


module.exports = router;
