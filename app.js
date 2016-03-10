var express = require('express');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect('localhost/api_db');

app.get('/', function(req, res){
    var body = [
        'Available:',
        '[GET]\t\t/items',
        '[GET]\t\t/items/:id',
        '[POST]\t\t/items',
        '[DELETE]\t/items/:id',
        '[GET]\t\t/items/:id/images/{imgId}',
        '[POST]\t\t/items/:id/images',
        '[DELETE]\t/items/:id/images/{imgId}',
    ].join('\n');

    res.status(400).end(body);
});

var itemService = require('./items/service.js');

app.get('/items', itemService.findAll);
app.get('/items/:id', itemService.findById);
app.post('/items', itemService.save);
app.delete('/items/:id', itemService.remove);

app.get('/items/:id/images/:imgId', itemService.findImage);
app.post('/items/:id/images', itemService.uploadImage);
app.delete('/items/:id/images/:imgId', itemService.removeImage);

app.listen(8000);
