# Handling File Uploads in Node

We've already created a simple API in Node, but now it's time to take it to the higher level. We are going to extend it with requests that involve uploading and serving files. Let's delve in!

### Changes in our API

First of all, we need to update out mongoose schema for _Item_ model. It will now store an array of related image names:

    // items/Item.js
    var Item = mongoose.model('items', new Schema({
        _id: String,
        name: String,
        value: Number,
        images: [String]
    }));

We will not store those images in the database, but instead persist them to some preselected directory. The API will include three additional methods:

    [GET]    /api/items/{id}/images/{img}
    [POST]   /api/items/{id}/images/
    [DELETE] /api/items/{id}/images/{img}

Our additional handlers will look like this:

    app.get('/items/:id/images/:imgId', itemService.findImage);
    app.post('/items/:id/images', itemService.saveImage);
    app.delete('/items/:id/images/:imgId', itemService.removeImage);

### Additional dependency

We would like to have file management, but we don't want to do it manually, do we? Fortunately there are some npm packages available to use, for example `multer`. First, remember to install it:

    npm install --save multer
    
By default, multer changes names of uploaded files to ensure that every one will be unique and can be stored in the same directory. We don't actually need that, so we can use a function for renaming uploaded files (might be useful some day). We also need to define a directory which will store the files. Complete configuration would look like this:

    var multer  = require('multer');

    var uploadDir = __dirname + '/../media/uploads/';
    var storage = multer.diskStorage({
        destination: uploadDir,
        filename: function (req, file, cb) {
            var itemId = req.params.id;
            cb(null, itemId + '_' + file.originalname);
        }
    });
    var upload = multer({ storage: storage });
    
Now we can build our method handlers much faster, and we will be using `upload.single(..)` middleware to have the upload handled behind the scenes. This function takes a file field name as a parameter, uploads a file and adds its metadata to the request object, which can be used in any of the middlewares that follow.

### Handling file upload

We start with arguably the most important handler - uploading an image. With `fileupload` package it is fairly easy. As we already have the file uploaded, all we beed to do is update the _item_ in the database. We could do it manually, but we can make use of Node's middleware flow and add just a step with updating _images_ array, and then proceed to the handler that is already responsible for saving the item to the database.

That one step should look like this:

    function processUploadImage(req, res, next) {
        var id = req.params.id;

        Item.findById(id).exec()
            .then((item) => {
                req.body.id = id;
                item.images.push(req.file.originalname);
                req.body.images = item.images;
                next();
            })
            .catch((err) => handleError(err, res, 'Failed to load item'));
    }
    
As you can see, we take the itemId and images parameters and put thm into `req.body`, so that the next middleware treat them as incoming POST parameters.

There is one slight problem, though. Now we have a chain of three handlers that are required by a single entry in our `app.js`. To make matters worse, we need to use `multer`'s method, which would force our server entry script to know about the implementation of a handler. Fortunately, we can merge the handlers into an array:

    // items/service.js
    var uploadImage = [upload.single('image'), processUploadImage, save];
    ...
    module.exports = {
    ...
    uploadImage,
    ...
    }

and then pass it as a handler to the router:

    // app.js
    app.post('/items/:id/images', itemService.uploadImage);

### Deleting file from the disk

This time we would need just two steps, as we can easily delete a file from the disk and update the `req.body` at the same time. The code is very similar to one above:

    function deleteImage(req, res, next) {
        var id = req.params.id;
        var imgId = req.params.imgId;

        Item.findById(id).exec()
            .then((item) => {
                var index = item.images.indexOf(imgId);
                if (index > -1) {
                    item.images.splice(index, 1);

                    fs.unlink(getImagePath(id, imgId));
                }

                req.body.id = id;
                req.body.images = item.images;
                next();
            })
            .catch((err) => handleError(err, res, 'Failed to load item'));
    }

We are using an utility function `getImagePath(..)` for finding a path for given file, because there is a trick needed to be done (and will be required in serving images to the users as well): we need to resolve the path in a way, that it does not contain any `../` parts (moving to the directory above). This is regarded as insecure and any request would be blocked:

    function getImagePath(itemId, imageId) {
        var filePath = uploadDir + itemId + '_' + imageId;
        return path.resolve(filePath);
    }

And again, we merge two handlers into an array, so that it looks better in the entry file.

### Serving images

This is clearly the easiest one, as `express` gives us a function for serving files:

    function findImage(req, res) {
        var id = req.params.id;
        var imgId = req.params.imgId;

        res.sendFile(getImagePath(id, imgId));
    }
    
### Final result

Our API is now much more useful, and can be extended further on. The code is available [on Github](https://github.com/mycodesmells/mongo-node-api).
