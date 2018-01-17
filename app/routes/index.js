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
        const isAdmin = req.session.isAdmin;
        res.render('album', { title: 'Albums', albumsData: results, isAdmin });
    });
});

router.post('/', (req, res) => {
    var albumName = req.body.albumName;
    if(albumName){
        albums.createAlbum(albumName, (err, results) => {
            if(err){
                console.log(err);
                res.render('album', { message: 'Error in creating new album', error: err });
                return;
            } else {
                var albumID = results.insertId;
                var albumUrl = '/albums/'+albumID;
                res.json({
                    albumName,
                    albumUrl,
                    albumID
                })
            }
        });
    }

});

module.exports = router;
