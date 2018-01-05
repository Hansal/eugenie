var express = require('express');
var router = express.Router();
var config = require('../lib/config');
var azure = require('../lib/azure');
var util = require('util');
let multer  = require('multer');
var streamifier = require('streamifier');


let upload  = multer({
    storage: multer.memoryStorage()
});



// const MulterAzureStorage = require('multer-azure-storage');


// const upload = multer({
//     storage: new MulterAzureStorage({
//         azureStorageConnectionString: config.azure.azureStorageConnectionString,
//         azureStorageAccessKey: config.azure.azureStorageAccessKey,
//         azureStorageAccount: config.azure.azureStorageAccount,
//         containerName: 'year-end-party',
//         containerSecurity: 'blob'
//     }),
//     limits:{fileSize: 1000000},
//     fileFilter: function(req, file, cb){
//         checkFileType(file, cb);
//     }
// }).single('uploadImage');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Eugenie NY Bash' });
});



// /* GET home page. */
// router.post('/upload', function(req, res, next) {
//   upload(req, res, (err) => {
//     if(err){
//       res.json({
//           "msg": "error uploading with multer"
//       })
//     } else {
//       if(req.file == undefined){
//         res.render('index', {
//           msg: 'Error: No File Selected!'
//         });
//       } else {
//         res.render('index', {
//           msg: 'File Uploaded!',
//           file: `uploads/${req.file.filename}`
//         });
//       }
//     }
//   });
//
//   res.render('index', { title: 'Eugenie NY Bash' });
// });


// router.get('/blobs', (req, res, next) => {
//
// })

// router.post('/upload', function (req, res) {
//
//     var form = new multiparty.Form();
//
//     form.on('part', function(part) {
//         console.log("part called");
//         // console.log("Part");
//         // console.log(part);
//         // if (part.filename) {
//         //     var filename = part.filename;
//         //     var size = part.byteCount;
//         //
//         //     var onError = function(error) {
//         //         if (error) {
//         //             res.send({ grrr: error });
//         //         }
//         //     };
//         //     console.log(filename);
//         //     console.log(part);
//         //     console.log(size);
//         //     azure.uploadBlob(blockBlobContainerName, filename, part, size)
//         // } else {
//         //     form.handlePart(part);
//         // }
//         // res.json("test");
//         part.resume();
//     });
//
//     form.parse(req)
//     // , function(){
//     //     console.log("This was called parse");
//     // });
//     // form.parse(req, function(err, fields, files) {
//     //   res.writeHead(200, {'content-type': 'text/plain'});
//     //   res.write('received upload:\n\n');
//     //   res.end(util.inspect({fields: fields, files: files}));
//     // });
//     // res.send("SWEET");
// });
//



// form.parse(req, function(err, fields, files) {
//     const blockBlobContainerName = fields['blockBlobContainerName'].length > 0 ? fields['blockBlobContainerName'][0] : null
//     console.log(blockBlobContainerName);
//     if(blockBlobContainerName){
//         const blockBlobFilePart = files['blockBlobFile'] ? files['blockBlobFile'] : null;
//         if(blockBlobFilePart){
//             const blockBlobFile = blockBlobFilePart[0];
//             azure.uploadBlob(blockBlobContainerName, blockBlobFile.originalFilename, blockBlobFilePart, blockBlobFile.size, (error, results) => {
//                 if(error){
//                     console.log("Error");
//                     console.log(error);
//                 } else {
//                     console.log("Results");
//                     console.log(results);
//                 }
//             })
//         }
//     }
module.exports = router;
