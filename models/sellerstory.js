const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    name: String,
    selectstory: String,
    url: String,
    notes: String,
    create_user: String,
    editedby: Number,
    deleted: String,
    status: { type: String, default: "Pending" },
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    individual: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
}, { timestamps: true })
module.exports = mongoose.model('sellerstory', schema)