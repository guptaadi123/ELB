const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name: String,
    code: String,
    status: String,
    create_user: Number,
    editedby: Number,
    deleted: String,
    type: String,
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
}, { timestamps: true })
module.exports = mongoose.model('codedomain', schema)