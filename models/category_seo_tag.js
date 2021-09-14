const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    categories: [],
    seo_tag_id: String,
    deleted: String,
    
}, { timestamps: true })
module.exports = mongoose.model('category_seo_tag', schema)