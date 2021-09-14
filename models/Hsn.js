const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    number: String,
    taxid: { type: mongoose.Schema.Types.ObjectId, ref: "tax" },
    description: String,
    status: String,
    create_user: Number,
    editedby: Number,
    deleted: String,
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
}, { timestamps: true })
module.exports = mongoose.model('Hsn', schema)