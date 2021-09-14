const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    category: String,
    bussiness: { type: mongoose.Schema.Types.ObjectId, ref: "bussiness" },
}, { timestamps: true })
module.exports = mongoose.model('business_pro_category', schema)