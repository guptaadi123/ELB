const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    name: String,
    host: String,
    port: String,
    userName: String,
    password: String,
    from: String,
    sms_from: String,
    status: String,
    create_ts: {
        type:Date,
        default:Date.now
    },
    create_user:String,
    edit_ts: {
        type:Date,
        default:Date.now
    },
    editedby: {
        type: mongoose.Schema.Types.ObjectId, ref: "individual",
    },
    deleted: {
        type:String,
        default:null
    },
    deletedby: {
        type: mongoose.Schema.Types.ObjectId, ref: "individual",
    },
   
}, { timestamps: true })
module.exports = mongoose.model('emailsmsconfirgation', schema)