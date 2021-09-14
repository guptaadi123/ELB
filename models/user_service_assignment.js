const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    parent_entity_name: String,
    parent_entity_id: String,
    status_reson: String,
    status_reson_description: String,
    assing_timestamp: Number,
    resolve_timestamp: Number,
    last_accessed_timestamp: Number,
    keyidentifier_name: String,
    keyidentifier_value: String,
    priority_type: String,
    deleted: String,
    editedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    assing_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: "service" },
}, { timestamps: true })
module.exports = mongoose.model('userServiceAssignment', schema)