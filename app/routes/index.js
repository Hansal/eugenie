var express = require('express');
var router = express.Router();
var albums = require('../models/albums');



/* GET home page. */
router.get('/', function(req, res, next) {
    albums.getAlbums((err, results) => {
        if(err){
            console.log(err);
            res.render('album', { message: 'Error in getting data', error: err });
            return;
        }
        res.render('album', { title: 'Albums', albumsData: results });
    });
});

module.exports = router;
