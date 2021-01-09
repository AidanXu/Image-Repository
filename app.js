const external = require('./src/external');
const mongoConfig = require('./config/mongoConfig');
const objectID = require('mongodb').objectID;
const Joi = require('joi');
const express = require('express');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = YAML.load('./config/swagger.yaml');
const mongoose = require('mongoose');
const { stringify } = require('yamljs');
const { ObjectID } = require('mongodb');

mongoose.connect('mongodb://localhost/ImageRepo')
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('failed connection', err))

const app = express();

app.use(express.json());

// Create image class based on mongo schema
let Image = mongoose.model('Image', mongoConfig.imageSchema);

// Get all Images
app.get('/api/getImages', async (req, res) => {
    let images = await Image
        .find() // finds all
        .select({ id: 1, name: 1, url: 1 });
    res.send(images);
})

// Search for images based on tags
app.get('/api/getImages/:tag', async (req, res) => {
    
    let tags = new Array();
    tags.push(req.params.tag);
    let returnImages = new Array();
    // Find all words similar to this one
    external.thesaurus(req.params.tag)
        .then( async words => {
            for (let i = 0; i < words.synonyms.length; i++) {
                tags.push(words.synonyms[i]);
            }

            for (let j = 0; j < tags.length; j++) {
                let image = await Image
                    .find({ tags: { $regex: tags[j]}})
                    .select({ id: 1, name: 1, url: 1});
                // If image found with similar word, return it
                if (image.length != 0 && !returnImages.find(x => x.url === image.url)) {
                    returnImages.push(image);
                }
            }
            res.send(returnImages);
        })
})

// Search for similar images
app.get('/api/getImages/searchByImage/:url', async (req, res) => {
    
    let imageTags = new Array();
    let returnImages = new Array();
    // Find image tags from watson api
    external.classifyImage(req.params.url)
        .then(async tags => {
            for (let i = 0; i < tags.images[0].classifiers[0].classes.length; i++) {
                imageTags.push(tags.images[0].classifiers[0].classes[i].class);
            }
            // Search db for same tags
            for (let j = 0; j < imageTags.length; j++) {
                let image = await Image
                    .find({ tags: { $regex: imageTags[j]}})
                    .select({ id: 1, name: 1, url: 1});
                // If image found with similar word and unique url, return it
                if (image.length != 0 && !returnImages.find(x => x.url === image.url)) {
                    returnImages.push(image);
                }
            }
            res.send(returnImages);
        })
})

// Upload an Image
app.post('/api/getImages', async (req, res) => {
    
    // Create schema for checking input body
    const schema = Joi.object({
        name: Joi.string().required(),
        url: Joi.string().required()
    })
    // Validate Input and send error if problematic input
    const result = schema.validate(req.body);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }
    
    // Create new image to store in Mongo
    let image = new Image({
        name: req.body.name,
        url: req.body.url
    })
    // Use IBM watson api to classify image with tags and add to mongo image object
    external.classifyImage(req.body.url)
        .then(tags => {
            for (let i = 0; i < tags.images[0].classifiers[0].classes.length; i++) {
                image.tags.push(tags.images[0].classifiers[0].classes[i].class);
            }
            // Save the image to mongoDB
            mongoConfig.saveImage(image)
                .then(saved => {
                    res.send(saved);
            })
        })
})

// Get image by ID
app.get('/api/getImages/getById/:id', async (req, res) => {

    // Check is valid mongo id
    if (!ObjectID.isValid(req.params.id)) {
        res.status(400).send('Error: Invalid id');
        return;
    }

    let image = await Image
        .findOne({ _id: req.params.id})
    
    if (!image) {
        res.status(404).send('Error: image id not found');
        return;
    }

    res.send(image);
})

// Delete image by ID
app.delete('/api/getImages/getById/:id', async (req, res) => {
    // Check is valid mongo id
    if (!ObjectID.isValid(req.params.id)) {
        res.status(400).send('Error: Invalid id');
        return;
    }

    let image = await Image
        .findOneAndDelete({ _id: req.params.id})
    
    if (!image) {
        res.status(404).send('Error: image id not found');
        return;
    }

    res.send(image);
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));