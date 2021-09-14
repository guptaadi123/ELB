const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    accountholdername: String,
    bankname: String,
    branchname: String,
    accountnumber: String,
    ifsccode: String,
    additionalinfo: String,
    cancelledCheque: String,
    cancelledChequeName: String,
    completename: String,
    status: String,
    create_user: Number,
    editedby: Number,
    deleted: String,
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    individual: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
}, { timestamps: true })
module.exports = mongoose.model('bankdetails', schema)