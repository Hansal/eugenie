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
module.exports = albums;
