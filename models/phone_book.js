const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    phone_type: String, //(mobile,landline,fax)
    entity_type: String, //(main,alternate)
    countery_code: String,
    isd_code: Number,
    area_code: Number,
    phone_number: String,
    estension: Number,
    status: String,
    editedby: Number,
    deleted: String,
    code: String,
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    create_user: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    individual: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    bussiness: { type: mongoose.Schema.Types.ObjectId, ref: "bussiness" },
    bussiness_individual: { type: mongoose.Schema.Types.ObjectId, ref: "bussiness_individual" },
    otpVerified: String,
}, { timestamps: true })
module.exports = mongoose.model('phonebook', schema)