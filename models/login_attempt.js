const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    source_type: String,
    ipaddress: String,
    client_type: String,
    username: String,
    status: String,
    create_user:  { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    editedby: Number,
    deleted: String,
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },

}, { timestamps: true })
module.exports = mongoose.model('login_attemp', schema)