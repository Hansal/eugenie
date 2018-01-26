const express = require('express');
const async = require('async');

var albums = require('../models/albums');
var image = require('../models/images');
var utils = require('../lib/utils');
var config = require('config');
// const config = require('/etc/eugenie/config');
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
        const isAdmin = req.session.isAdmin;

        res.render('gallery', {
            title: results.albumData.albumName,
            subtitle: utils.formatDates(results.albumData.createdOn),
            imagesData: results.imageData,
            container: config.azure.container,
            albumID,
            openImage,
            isAdmin

        });
    });


});
// router.post('/:id/upload',  upload.array('blockBlobFile'), (req, res) => {
//     console.log("This was called");
//     console.log(req);
// });
router.post('/:id/upload', upload.array('blockBlobFile'), (req, res) => {
    console.time("SERVER-TIME");
  //   res.header("Access-Control-Allow-Origin", "*");
  //   res.header("Access-Control-Allow-Headers", "X-Requested-With");
  let returnJsonArray = [];
  // try {
      const blockBlobContainerName = config.azure.azureContainer;
      console.log("LOGGING FILE NAMES");
      //   console.log(req.files);
      console.log("----------------");
      var files = req.files;
      console.log(files);
async.forEachOf(files, function(file, key, loopCallback){
    console.time("ASYNC-FOR");
    const albumID = req.params.id;
    async.waterfall([
      function(callback) {
          console.time("ASYNC-WATERFALL");
          console.log(file);
          var stream = streamifier.createReadStream(file.buffer);

          var d = new Date();
          var originalFileName = file.originalname.split('.');
          var options = {contentSettings:{contentType:'Image/'+originalFileName[1]}};
          var fileName = originalFileName[0]+"-"+d.getTime()+"."+originalFileName[1];
          console.time("AZURE-UPLOAD");
          azure.uploadBlobFromStream(blockBlobContainerName, fileName, stream, file.size, options, (error, results) => {
              console.timeEnd("AZURE-UPLOAD");
              if(error){
                  console.log(error);
                  callback(error, null);
              } else {
                  console.log("Reached azure end");
                  callback(null, fileName)
              }
          });
      },
      function(fileName, callback) {
          var imageUrl = config.azure.azureEndpoint+blockBlobContainerName+"/"+fileName;
          console.time("DB-INSERT");
          image.addImage(imageUrl,albumID,(err, results) => {
              console.timeEnd("DB-INSERT");
              if(err){
                  console.log(error);
                  callback(error, null);
              } else {
                  const response = {
                      imageUrl,
                      imageID: results.insertId
                  }
                  console.log("Reached DB end");
                  callback(null, response);
              }
          });
      }
  ], function (err, result) {
      console.timeEnd("ASYNC-WATERFALL");
      console.log("Reached waterfall end");
      if(err){
          console.log(error);
          loopCallback(err);
      } else {
          console.log(result);
          returnJsonArray.push(result)
          loopCallback(null);
      }
  });


}, function(err){
    console.timeEnd("ASYNC-FOR");
    if(err){
        console.log(err);
        res.json(err);
        return;
    }
    console.log(returnJsonArray);
    res.json(returnJsonArray);
    console.log("User For Loop Completed");
    console.timeEnd("SERVER-TIME");
});











      const file = req.files[0];



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
  // } catch (e) {
  //     console.log(e);
  //     res.json(e);
  // }
});


/* GET home page. */
router.get('/', function(req, res, next) {
    albums.getAlbums((err, results) => {
        if(err){
            console.log(err);
            res.render('album', { message: 'Error in getting data', error: err });
            return;
        }
        const isAdmin = req.session.isAdmin;
        res.render('album', { title: 'Albums', albumsData: results, isAdmin});
    });
});

router.get('/:albumID/delete/:imageID', (req, res, next) => {
    var blockBlobContainerName = config.azure.azureContainer;
    let fileName = '';
    if(req.session.isAdmin){
        const { imageID, albumID } = req.params;
        async.waterfall([
            (callback) => {
                //Get the fileName
                image.getImagesByIndex(imageID, (error, results) => {
                    if(error){
                        callback(error, null);
                    } else {
                        var h = config.azure.azureEndpoint + blockBlobContainerName + "/";
                        fileName = results[0].imageURL.substr(h.length);
                        callback(null,fileName);
                    };
                });
            },
            (fileName, callback) => {
                //Delete the file on azure
                console.log(fileName);
                azure.deleteBlob(blockBlobContainerName, fileName, (error, results) => {
                    if(error){
                        callback(error, null);
                    } else {
                        console.log(results);
                        callback(null, results)
                    }
                });
            },
            (data, callback) => {
                // Delete the image in DB
                image.deleteImageByImageIDAlbumID(imageID, albumID, (error, results) => {
                    if(error){
                        console.log(error);
                        callback(error, null);
                        return;
                    } else {
                        callback(null, results);
                    }
                });
            }
        ], function (err, result) {
            if(err){
                res.json({
                    'error': err
                })
            } else {
                res.json({
                        imageID,
                        albumID,
                        fileName
                });
            }
        });



    } else {
        res.json({
            message: "403 Unauthorized"
        })
    }

});

module.exports = router;
