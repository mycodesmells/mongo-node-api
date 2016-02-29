var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Item = mongoose.model('items', new Schema({
    _id: String,
    name: String,
    value: Number
}));

module.exports = Item;
