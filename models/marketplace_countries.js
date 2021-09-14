const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    country_code: String,
    domain_url: String,
    text: String,
}, { timestamps: true })
module.exports = mongoose.model('marketplace_country', schema)