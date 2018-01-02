var express = require('express');
var router = express.Router();
var albums = require('../models/albums');
var image = require('../models/images');

/* GET album by ID listing. */
router.get('/:id', function(req, res, next) {
    const albumId = req.params.id || null;
    const imageID = req.query.imageID || null;
    let openImage = {};

    image.getImagesByAlbumID(albumId, (err, results) => {
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

/* GET home page. */
router.get('/', function(req, res, next) {
    albums.getAlbums((err, results) => {
        if(err){
            console.log(err);
            res.render('album', { message: 'Error in getting data', error: err });
            return;
        }
        res.render('album', { title: 'Album', albumsData: results });
    });
});

module.exports = router;
