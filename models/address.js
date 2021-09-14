const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    address_type: String,
    add_line1: String,
    add_line2: String,
    city: String,
    // zip_id: Number,
    zipcode: Number,
    status: String,
    editedby: Number,
    deleted: String,
    code: String,
    // create_user: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    individual: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    bussiness: { type: mongoose.Schema.Types.ObjectId, ref: "bussiness" },
    country: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain_values" },
    state: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain_values" },
    sameasAbove: Boolean,
    // city: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain_values" },

}, { timestamps: true })
module.exports = mongoose.model('address', schema)