const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "service" },
    code_domain: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain" },
    code_domain_value: String,
    create_user: String,
    relationshipType: String,
    deleted: String,
}, { timestamps: true })
module.exports = mongoose.model('service_code_domain_value', schema)