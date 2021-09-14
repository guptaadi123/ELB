const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    userId: String,
    roleId: String,
    startDate: String,
    endDate: String,
}, { timestamps: true })
module.exports = mongoose.model('user_role', schema)
