const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    country: String,
    bussiness: { type: mongoose.Schema.Types.ObjectId, ref: "bussiness" },
}, { timestamps: true })
module.exports = mongoose.model('bus_marketplace_country', schema)