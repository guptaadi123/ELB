const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    url_type: String, //(companywebsite,facebook,instagram etc)
    url: String,
    status: String,
    editedby: Number,
    deleted: String,
    create_user: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    individual: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    bussiness: { type: mongoose.Schema.Types.ObjectId, ref: "bussiness" },
}, { timestamps: true })
module.exports = mongoose.model('url', schema)