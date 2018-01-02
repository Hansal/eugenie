const express = require('express');
const async = require('async');

var albums = require('../models/albums');
var image = require('../models/images');
var utils = require('../lib/utils');




var router = express.Router();
/* GET album by ID listing. */
router.get('/:id', function(req, res, next) {
    const albumId = req.params.id || null;
    const imageID = req.query.imageID || null;
    let openImage = {};


    // an example using an object instead of an array
    async.parallel({
        albumData: function(callback) {
            albums.getAlbumsByIndex(albumId, (err, albumResults) => {
                callback(null, albumResults[0]);
            });
        },
        imageData: function(callback) {
            image.getImagesByAlbumID(albumId, (err, imageResults) => {
                callback(null, imageResults);
            });
        }
    }, function(err, results) {
        // results is now equals to: {one: 1, two: 2}
        if(err){
            console.log(err);
            res.render('gallery', { message: 'Error in getting data', error: err });
            return;
        }

        if(imageID){
            openImage = results.imageData.filter((obj) => {
                return obj.ID == imageID
            })[0];
        }
        console.log(results.albumData.albumName);
        res.render('gallery', {
            title: results.albumData.albumName,
            subtitle: utils.formatDates(results.albumData.createdOn),
            imagesData: results.imageData,
            openImage
        });
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
        res.render('album', { title: 'Albums', albumsData: results });
    });
});

module.exports = router;
