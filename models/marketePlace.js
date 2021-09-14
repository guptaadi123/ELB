const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    description: String,
    status: String,
    deleted: String,
    sellWebsites: [{ link: String }],
    products: [{ name: String }],
    capacity: [{cap: String}],
    firstYear: String,
    secondYear: String,
    thirdYear: String,
    categories: [],
    editedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain_values" },
    country: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain_values" },
    industry: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    individual: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
}, { timestamps: true })
module.exports = mongoose.model('marketeplace', schema)