const dateFormat = require('dateformat');

const utils = {};

utils.formatDates = (inputDate) => {
    var now = new Date(inputDate);
    return dateFormat(now, "dddd, mmmm dS, yyyy");
}

module.exports = utils;
