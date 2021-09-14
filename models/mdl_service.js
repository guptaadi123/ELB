const mongoose=require('mongoose');
var schema=mongoose.Schema({
    name:String,
    position:Number,
    code:String,
    description:String,
    menuicon: String,
    parent_id:{ type: mongoose.Schema.Types.ObjectId, ref: "service" },
    route:String,
    type:String,
    status: String,
    service_code: String,
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
module.exports=mongoose.model('service',schema);