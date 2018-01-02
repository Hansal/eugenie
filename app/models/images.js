const db = require('../lib/db');

const images = {};

images.getImages = (callback) => {
    const sql = `SELECT *
        FROM images ORDER BY ID DESC`;
    db.execute(sql, [], callback);
}

images.getImagesByIndex = (index, callback) => {
    const sql = `SELECT *
        FROM images WHERE ID = ?`;
    db.execute(sql, [index], callback);
}

images.getImagesByAlbumID = (index, callback) => {
    const sql = `SELECT *
        FROM images WHERE albumID = ?`;
    db.execute(sql, [index], callback);
}

images.getImagesFromIndex = (start, limit, callback) => {
    const sql = `SELECT *
        FROM images WHERE ID > ? LIMIT ?`;
    db.execute(sql, [start, limit], callback);
}


module.exports = images;
