const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name: String,
    parentRole: String,
    description: String,
    roleType: String,
    status: String,
    create_user: String,
    editedby: Number,
    deleted: String,
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    edit_ts: {
        type:Date,
        default:Date.now
    },   
    deletedby: {
        type:mongoose.Schema.Types.ObjectId,ref:"user"
    },

}, { timestamps: true })
module.exports = mongoose.model('role', schema)

