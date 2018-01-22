var fs = require('fs');
var util = require('util');
var guid = require('node-uuid');
var crypto = require('crypto');
var storage = require('azure-storage');
// const config = require('./config');
// const config = require('/etc/eugenie/config');
const config = require('config');


var blobService = storage.createBlobService(config.azure.azureStorageConnectionString);

var imageToUpload = "HelloWorld.png";
var blockBlobContainerName = config.azure.azureContainer;
var blockBlobName = "HelloWorld.png";

const azure = {};


/**
* Lists blobs in the container.
* @ignore
*
* @param {BlobService}        blobService                         The blob service client.
* @param {string}             container                           The container name.
* @param {object}             token                               A continuation token returned by a previous listing operation.
*                                                                 Please use 'null' or 'undefined' if this is the first operation.
* @param {object}             [options]                           The request options.
* @param {int}                [options.maxResults]                Specifies the maximum number of directories to return per call to Azure ServiceClient.
*                                                                 This does NOT affect list size returned by this function. (maximum: 5000)
* @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to.
*                                                                 Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                 execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                 The default value is false.
* @param {errorOrResult}      callback                            `error` will contain information
*                                                                 if an error occurs; otherwise `result` will contain `entries` and `continuationToken`.
*                                                                 `entries`  gives a list of directories and the `continuationToken` is used for the next listing operation.
*                                                                 `response` will contain information related to this operation.
*/
function listBlobsHelper(blobService, container, token, options, blobs, callback) {
  blobs = blobs || [];

  blobService.listBlobsSegmented(container, token, options, function (error, result) {
    if (error) return callback(error);

    blobs.push.apply(blobs, result.entries);
    var token = result.continuationToken;
    if (token) {
      console.log('   Received a segment of results. There are ' + result.entries.length + ' blobs on this segment.');
      listBlobsHelper(blobService, container, token, options, blobs, callback);
    } else {
      console.log('   Completed listing. There are ' + blobs.length + ' blobs.');
      callback(null, blobs);
    }
  });
}

azure.uploadBlobFromStream = (blockBlobContainerName, blobName, stream, size, options, callback) => {
    blobService.createBlockBlobFromStream(blockBlobContainerName, blobName, stream, size, options, (error, results) => {
        if (error){
            console.log(error);
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
};


azure.listBlobs = (blockBlobContainerName, callback) => {
    const blobList = [];
    listBlobsHelper(blobService, blockBlobContainerName, null, null, null, (error, results) => {
        if (error) {
        callback(error, null);
        } else {
            for (var i = 0; i < results.length; i++) {
              blobList.push(util.format('   - %s (type: %s)'), results[i].name, results[i].blobType);
            }
            callback(null, blobList);
        }
    });
}

azure.deleteBlob = (blockBlobContainerName, blockBlobName, callback) => {
    var deleteOption = { deleteSnapshots: storage.BlobUtilities.SnapshotDeleteOptions.BLOB_AND_SNAPSHOTS };
    blobService.deleteBlob(blockBlobContainerName, blockBlobName, deleteOption, (error, results) => {
        if (error){
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
}

azure.deleteContainer = (blockBlobContainerName, callback) => {
    blobService.deleteContainerIfExists(blockBlobContainerName, (error, results) => {
        if(error){
            callback(error, null);
        } else {
            callback(null, results)
        }

    });
}



module.exports = azure;
