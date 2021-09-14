const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    status: String,
    create_user: Number,
    editedby: Number,
    deleted: String,
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    codedomain1: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain" },
    codedomain_values1: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain_values" },
    codedomain2: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain" },
    codedomain_values2: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain_values" },
}, { timestamps: true })
module.exports = mongoose.model('related_domain', schema)