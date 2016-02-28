var express = require('express');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect('localhost/api_db')

var Schema = mongoose.Schema;
var Item = mongoose.model('items', new Schema({
    _id: String,
    name: String,
    value: Number
}));

app.get('/', function(req, res){
    var body = [
        'Available:',
        '[GET]\t\t/items',
        '[GET]\t\t/items/:id',
        '[POST]\t\t/items',
        '[DELETE]\t/items/:id',
    ].join('\n');

    res.status(400).end(body);
});

app.get('/items', function(req, res){
    Item.find().exec()
        .then((items)=>res.json(items))
        .catch((err) => handleError(err, res, 'Failed to load items'));
});
app.get('/items/:id', function(req, res){
    var id = req.params.id;

    Item.findById(id).exec()
        .then((item) => res.json(item))
        .catch((err) => handleError(err, res, 'Failed to load item'));
});
app.post('/items', function(req, res){
    var data = req.body;
    data.id = data.id || new mongoose.mongo.ObjectID();

    Item.findOneAndUpdate({_id: data.id}, data, {upsert:true})
        .then(() => res.json({id: data.id}))
        .catch((err) => handleError(err, res, 'Failed to save item'));
});
app.delete('/items/:id', function(req, res){
    var id = req.params.id;

    Item.remove({_id: id})
        .then(() => res.json({_id:id}))
        .catch((err) => handleError(err, res, 'Failed to delete item'));
});

app.listen(8000);
