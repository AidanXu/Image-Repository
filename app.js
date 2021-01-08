const external = require('./src/external');
const express = require('express');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = YAML.load('./config/swagger.yaml');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/testing')
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('failed connection', err))

const app = express();

app.use(express.json());

app.get('/api/getImages/', (req, res) => {
    res.send('ok');
})

app.get('/api/getImages/:tag', (req, res) => {
    res.send(req.params.tag);
})

app.post('/api/getImages/', (req, res) => {
    res.send();
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));