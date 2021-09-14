const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    name: String,
    percentage: String,
    type: String,
    description: String,
    status: String,
    create_user: Number,
    editedby: Number,
    deleted: String,
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
}, { timestamps: true })
module.exports = mongoose.model('tax', schema)