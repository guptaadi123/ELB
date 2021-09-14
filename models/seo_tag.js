const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    tags: [],
    deleted: String,

}, { timestamps: true })
module.exports = mongoose.model('seo_tag', schema)