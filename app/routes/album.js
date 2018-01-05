const express = require('express');
const async = require('async');

var albums = require('../models/albums');
var image = require('../models/images');
var utils = require('../lib/utils');
// var config = require('../lib/config');
const config = require('/etc/eugenie/config');
var azure = require('../lib/azure');
var util = require('util');
let multer  = require('multer');
var streamifier = require('streamifier');


let upload  = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10000000
    }
});



var router = express.Router();
/* GET album by ID listing. */

router.get('/:id', function(req, res, next) {
    const albumID = req.params.id || null;
    const imageID = req.query.imageID || null;
    let openImage = {};


    // an example using an object instead of an array
    async.parallel({
        albumData: function(callback) {
            albums.getAlbumsByIndex(albumID, (err, albumResults) => {
                console.log(albumResults);
                callback(null, albumResults[0]);
            });
        },
        imageData: function(callback) {
            image.getImagesByAlbumID(albumID, (err, imageResults) => {
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
            albumID,
            openImage
        });
    });


});

router.post('/:id/upload', upload.array('blockBlobFile'), (req, res) => {
  //   res.header("Access-Control-Allow-Origin", "*");
  //   res.header("Access-Control-Allow-Headers", "X-Requested-With");
  try {
      const { blockBlobContainerName } = req.body;
      const file = req.files[0];
      const albumID = req.params.id;
      console.log(req.files);
      var stream = streamifier.createReadStream(file.buffer);
      var options = {contentSettings:{contentType:'Image/png'}}
      var d = new Date();
      var fileName = blockBlobContainerName+"-"+d.getTime()+'.png';
      async.waterfall([
        function(callback) {
            azure.uploadBlobFromStream(blockBlobContainerName, fileName, stream, file.size, options, (error, results) => {
                if(error){
                    console.log(error);
                    callback(error, null);
                } else {
                    callback(null, fileName)
                }
            });
        },
        function(fileName, callback) {
            var imageUrl = config.azure.azureEndpoint+blockBlobContainerName+"/"+fileName;
            image.addImage(imageUrl,albumID,(err, results) => {
                if(err){
                    console.log(error);
                    callback(error, null);
                } else {
                    const response = {
                        imageUrl,
                        imageID: results.insertId
                    }
                    callback(null, response);
                }
            });
        }
    ], function (err, result) {
        if(err){
            res.json({
                'error': err
            })
        } else {
            res.json(result);
        }
    });


    //   azure.uploadBlobFromStream(blockBlobContainerName, file.originalname, stream, file.size, options, (error, results) => {
    //       if(error){
    //           console.log("Error");
    //           console.log(error);
    //       } else {
      //
      //
    //           console.log("Results");
    //           console.log(results);
    //           console.log("Gpt data");
    //           res.json(file);
    //       }
    //   });

    //   res.json(file);
  } catch (e) {
      console.log(e);
      res.json(e);
  }
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
