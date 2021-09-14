const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    username: String,
    relation_type: String,
    job_title: String,
    job_function: String,
    department: String,
    status: String,
    editedby: Number,
    deleted: String,
    create_user: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    bussiness: { type: mongoose.Schema.Types.ObjectId, ref: "bussiness" },
    individual: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
}, { timestamps: true })
module.exports = mongoose.model('bussiness_individual', schema)