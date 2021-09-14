const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    value: String,
    code: String,
    position: Number,
    status: String,
    create_user: Number,
    editedby: Number,
    deleted: String,
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    codedomain: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain" },
}, { timestamps: true })
module.exports = mongoose.model('codedomain_values', schema)