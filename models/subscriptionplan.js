const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    name: String,
    duration: String,
    commission: String,
    hashofproducts: String,
    fee: String,
    create_user: Number,
    editedby: Number,
    deleted: String,
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },

}, { timestamps: true })
module.exports = mongoose.model('subscriptionplan', schema)