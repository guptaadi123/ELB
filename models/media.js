const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    parent_entity_id: String,
    parent_entity_name: String,
    Doc_type: String, //(incorporation cert,addhar,user agrement,cancelled check)
    description: String,
    document_name: String,
    document_id: String, //(eg. aadhar numbar,pan number)
    file_type: String, //(pdf, word)
    original_file_name: String,
    encrypted_file_name: String,
    path: String,
    url: String,
    start_ts: String,
    end_ts: String,
    status: String,
    editedby: Number,
    deleted: String,
    create_user: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    individual: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
    sellerstory: { type: mongoose.Schema.Types.ObjectId, ref: "sellerstory" },
}, { timestamps: true })
module.exports = mongoose.model('media', schema)