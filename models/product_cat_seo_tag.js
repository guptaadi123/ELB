const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    category_seo_tag_id: String,
    product_id: String,
    deleted: String,
    
}, { timestamps: true })
module.exports = mongoose.model('product_cat_seo_tag', schema)