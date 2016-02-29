var Item = require('./Item');

function handleError(err, res, msg) {
    console.error(err);
    res.status(500).json({err, msg});
}

function findAll(req, res){
    Item.find().exec()
        .then((items) => res.json(items))
        .catch((err) => handleError(err, res, 'Failed to load items'));
};

function findById(req, res){
    var id = req.params.id;

    Item.findById(id).exec()
        .then((item) => res.json(item))
        .catch((err) => handleError(err, res, 'Failed to load item'));
};

function save(req, res){
    var data = req.body;
    data.id = data.id || new mongoose.mongo.ObjectID();

    Item.findOneAndUpdate({_id: data.id}, data, {upsert:true})
        .then(() => res.json({id: data.id}))
        .catch((err) => handleError(err, res, 'Failed to save item'));
};

function remove(req, res){
    var id = req.params.id;

    Item.remove({_id: id})
        .then(() => res.json({_id:id}))
        .catch((err) => handleError(err, res, 'Failed to delete item'));
};

module.exports = {
    findAll: findAll,
    findById: findById,
    save: save,
    remove, remove
};

