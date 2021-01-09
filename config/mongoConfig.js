const { string } = require('joi');
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    name: String,
    url: String,
    tags: [ String ],
    uploadedDate: { type: Date, default: Date.now }
})

async function saveImage(image) {
    const saved = await image.save();
    return saved;
}

module.exports.imageSchema = imageSchema;
module.exports.saveImage = saveImage;