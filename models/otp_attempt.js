const mongoose = require('mongoose')

const schema = new mongoose.Schema({   
    otp_entered: String,
    status: String,
    create_user:  { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    editedby: Number,
    deleted: String,
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    otp: { type: mongoose.Schema.Types.ObjectId, ref: "otp" },

}, { timestamps: true })
module.exports = mongoose.model('otpattemp', schema)