const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    industry_type: String,
    otherIndustry: String,
    bussiness: { type: mongoose.Schema.Types.ObjectId, ref: "bussiness" },
}, { timestamps: true })
module.exports = mongoose.model('targat_buyer_industry', schema)