const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    parent_entity_name: String, //(e.g.product)
    context_entity_name: String, // (eg.user event) can be null
    context_entity_id: Number, // (e.g record id of event)
    field_name: String,
    old_value: String, // (sharma)
    new_value: String, // (verma)
    history_type: String, // (view / edit / list / add)
    status: String,
    user_session_id: String,
    deleted: String,
    editedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    individual: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
    business: { type: mongoose.Schema.Types.ObjectId, ref: "bussiness" },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "service" },
}, { timestamps: true })
module.exports = mongoose.model('history', schema)