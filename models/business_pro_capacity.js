const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    producat_name: String,
    capacity: String,
    cid: String,
    bussiness: { type: mongoose.Schema.Types.ObjectId, ref: "bussiness" },
}, { timestamps: true })
module.exports = mongoose.model('business_pro_capacity', schema)