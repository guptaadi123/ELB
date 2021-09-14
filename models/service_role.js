const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    customName: String,
    roleId: String,
    serviceId: String,
    create_user: Number,
    status: String,
    editedby: Number,
    deleted: String,
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
}, { timestamps: true })
module.exports = mongoose.model('service_role', schema)

