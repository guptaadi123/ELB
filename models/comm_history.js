const mongoose=require('mongoose');
const schema = new mongoose.Schema({
    composition_id : String,
    parent_entity_name : String,
    parent_entity_id:String,   
    from:String,
    to:String,
    cc:String,
    bcc:String,
    subject:String,
    body:String,
    medium:String,
    alert_type:String,
    sent_timestamp: {
        type:Date,
        default:Date.now
    },
    received_timestamp: {
        type:Date,
        default:Date.now
    },
    read_timestamp: {
        type:Date,
        default:""
    },
    service_id: String,
    communication_compose_id:String,
}, { timestamps: true })
  
    module.exports=mongoose.model('communication_historys', schema);


