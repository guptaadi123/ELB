const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    start_ts: {
        type:Date,
        default:Date.now
    },
    end_ts: {
        type:Date,
        default:""
    },
    status: String,
    create_user:  { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    editedby: Number,
    deleted: String,
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    login_attemp: { type: mongoose.Schema.Types.ObjectId, ref: "login_attemp" },
    otp_attemp: { type: mongoose.Schema.Types.ObjectId, ref: "otp" },

}, { timestamps: true })
module.exports = mongoose.model('user_session', schema)