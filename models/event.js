const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    parent_entity_name: String, //(e.g.product)
    parent_entity_id: String, //(e.g.product)
    event_type: String,
    text: String,
    follow_up_type: String,
    follow_up_timestamp: String,
    status: String,
    deleted: String,
    editedby: Number,
    deletedby: Number,
    individual: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
    business: { type: mongoose.Schema.Types.ObjectId, ref: "bussiness" },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "service" },
}, { timestamps: true })
module.exports = mongoose.model('event', schema)