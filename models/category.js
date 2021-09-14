const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name: String,
    status: String,
    priority: Number,
    notes: String,
    create_user: String,
    approveby : String,
    approvedate : Date,
    editedby: Number,
    deleted: String,
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "category" },
}, { timestamps: true })
module.exports = mongoose.model('category', schema)