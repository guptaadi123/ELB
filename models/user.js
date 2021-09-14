const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    ind_id: Number,
    username: String,
    parent_user: String,
    descreption: String,
    password: String,
    status: String,
    create_user: String,
    editedby: Number,
    deleted: String,
    quetionAns : [],
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    individual: { type: mongoose.Schema.Types.ObjectId, ref: "individual" }
}, { timestamps: true })
module.exports = mongoose.model('user', schema)