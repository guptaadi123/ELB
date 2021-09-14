const mongoose=require('mongoose');
const schema = new mongoose.Schema({
    name:String,
    medium:String,
    alert_type:String,
    from:String,
    to:String,
    cc:String,
    bcc:String,
    subject:String,
    body:String,
    status: String,
    create_ts: {
        type:Date,
        default:Date.now
    },
    create_user: {
        type:mongoose.Schema.Types.ObjectId,ref:"user"
    },
    edit_ts: {
        type:Date,
        default:Date.now
    },
    editedby: {
        type:mongoose.Schema.Types.ObjectId,ref:"user"
    },
    deleted: {
        type:Number,
        default:0
    },
    deletedby: {
        type:mongoose.Schema.Types.ObjectId,ref:"user"
    },
    });
    module.exports=mongoose.model('communication_template', schema);
