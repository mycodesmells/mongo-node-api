# Mongo API with Node JS

Love and marriage go together like a horse and carriage... But you know what else is a great fit? It's Node and MongoDB. They are both Java Script-based, almost begging you to use them both. Let's take a look on creating a simple database API with a simple HTTP server written in Node.

### Requirements

We obviously need Node and MongoDB to have this example up and running. To make the development process easier, we are using some of the best npm's packages: _express_ and _mongoose_ (MongoDB academy recommends original _mongodb_ but in my experience this one is slightly more user-friendly). On top of _express_ we also use _body-parser_ for proper handling of incoming body in POST requests.

### Basic REST actions

Our server has to offer four basic actions to be performed on a model:

- getting all items (via GET)
- getting one item by its ID (GET)
- saving/changing one item (POST)
- deleting one item by its ID (DELETE)

### Integration using Mongoose

To use MongoDB via _mongoose_, we need two things. First we need to set up a connection:

    mongoose.connect('localhost/api_db');

and then define a model which itself provides us with some useful methods:

    var Schema = mongoose.Schema;
    var Item = mongoose.model('items', new Schema({
        _id: String,
        name: String,
        value: Number
    }));

### Minimal approach

    app.get('/items', function(req, res){
        Item.find().exec()
            .then((items) => res.json(items))
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

As you can see, there is a lot of things going on in there. To make your code more readable, you might want to split the code in separate files, eg. into `itemService.js` and have the routes defined as:

    var itemService = require('./items/service.js');

    app.get('/items', itemService.findAll);
    app.get('/items/:id', itemService.findById);
    app.post('/items', itemService.save);
    app.delete('/items/:id', itemService.remove);

Full code of this example is available [on Github](https://github.com/mycodesmells/mongo-node-api).
