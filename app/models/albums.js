const db = require('../lib/db');

const albums = {};

albums.getAlbums = (callback) => {
    const sql = `SELECT *
        FROM albums ORDER BY ID DESC`;
    db.execute(sql, [], callback);
}

albums.getAlbumsByIndex = (index, callback) => {
    const sql = `SELECT *
        FROM albums WHERE ID = ?`;
    db.execute(sql, [index], callback);
}

albums.createAlbum = (albumName, callback) => {
    const sql = `INSERT INTO albums (albumName) VALUES (?)`;
    db.execute(sql, [albumName], callback);
}
module.exports = albums;
