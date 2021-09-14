const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    marketplace_country_id: { type: mongoose.Schema.Types.ObjectId, ref: "marketplace_country" },
    product_id: String,
    terms_agreed: String,
    status: String,
    create_user: String,
    deleted: String,
    editedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
}, { timestamps: true })
module.exports = mongoose.model('marketplace_country_product', schema)