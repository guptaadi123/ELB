const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    otp_type: String, //(login,phone change,registration,change password)
    otp_medium_type: String, // (sms,email)
    otp: String,
    // otp_expire_ts: Datetime,
    otp_expire_ts: Date, //30 sec
    phone_book_id: String, // phone book table id
    email_add_id: String, // email table id
    status: String,
    create_user:  { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    editedby: Number,
    deleted: String,
    individual: String,
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    login_attemp: { type: mongoose.Schema.Types.ObjectId, ref: "login_attemp" },


}, { timestamps: true })
module.exports = mongoose.model('otp', schema)