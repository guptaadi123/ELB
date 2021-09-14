const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    email_type: String, // (personel,corporate)
    email_add: String,
    status: String,
    editedby: Number,
    deleted: String,
    code: String,
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    create_user: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    bussiness: { type: mongoose.Schema.Types.ObjectId, ref: "bussiness" },
    individual: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    bussiness_individual: { type: mongoose.Schema.Types.ObjectId, ref: "bussiness_individual" },
}, { timestamps: true })
module.exports = mongoose.model('email_address', schema)