var mongoose = require('mongoose');

var Url = mongoose.model('Url',
    new mongoose.Schema({
        url: {
            type: String,
            required: true,
            unique: true
        },
        code: {
            type: String,
            required: true
        },
        hash: {
            type: String,
            required: true
        }
    }));

module.exports = Url;