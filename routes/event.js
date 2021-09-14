var express = require("express");
var Event = require("../models/event");
var router = express.Router();
const CodeDomain = require("../models/code_domain");
const CodeDomainValues = require("../models/code_domainValues");

router.get("/getAll", async function(req, res, next) {
    var evt = await Event.find({ deleted: null })
    res.json({ message: "success", data: evt });
});

// getAll Against Individual by sellerType
router.get("/getAll/individual/:id/:sellerType", async function(req, res, next) {
    var evt = await Event.find({ deleted: null, individual: req.params.id , parent_entity_name:req.params.sellerType}).populate('individual').lean().sort({ createdAt: -1 })
    let eventType = [];
    for (let i in evt) {
        eventType.push(evt[i].event_type);
    }

    var fetch = await CodeDomainValues.find({ deleted: null, _id: {$in: eventType} }).sort({position:1,value:1});;

    console.log("fetch>>>",fetch)
    for (let i in fetch) {
        for (let k in evt) {
            if (evt[k].event_type == ''+fetch[i]._id) {
                evt[k].event_name = fetch[i].value;
            }
        }
    }
    res.json({ message: "success", data: evt });
});

// getAll Against Individual
router.get("/getAll/individual/:id", async function(req, res, next) {
    var evt = await Event.find({ deleted: null, individual: req.params.id}).populate('individual').lean()

    let eventType = [];
    for (let i in evt) {
        eventType.push(evt[i].event_type);
    }

    var fetch = await CodeDomainValues.find({ deleted: null, _id: {$in: eventType} }).sort({position:1,value:1});;

    console.log("fetch>>>",fetch)
    for (let i in fetch) {
        for (let k in evt) {
            if (evt[k].event_type == ''+fetch[i]._id) {
                evt[k].event_name = fetch[i].value;
            }
        }
    }

    res.json({ message: "success", data: evt });
});

// getAll Against product
router.get("/getAll/product/:id", async function(req, res, next) {
    var evt = await Event.find({ deleted: null, product: req.params.id }).populate('product')
    res.json({ message: "success", data: evt });
});

// getAll Against business
router.get("/getAll/business/:id", async function(req, res, next) {
    var evt = await Event.find({ deleted: null, business: req.params.id }).populate('business')
    res.json({ message: "success", data: evt });
});

// getAll EventType
router.get("/getAll/eventType", async function(req, res, next) {
    var check = await CodeDomain.findOne({ code: 'SLREVNTTYP' });
    var fetch = await CodeDomainValues.find({ deleted: null,status:"active", codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success",eventType:fetch });
});

router.post("/create", async function(req, res, next) {
    console.log('req',req.body);
    // var eventExist = await Event.findOne({ event_type: req.body.event_type ,individual: req.body.individual});
    // console.log('eventExist',eventExist);
    // if(eventExist && eventExist._id){
    //     res.json({ message: "already exist"});
    // }else{
    // }
    var evt = await Event.create(req.body);
    res.json({ message: "success", data: evt });
});

router.get("/:id", async function(req, res, next) {
    var evt = await Event.findOne({ _id: req.params.id });
    res.json({ message: "success", data: evt });

});

router.delete('/:id', async function(req, res, next) {
    // var evt = await Event.updateOne({
    //     _id: req.params.id,
    // }, {
    //     $set: {
    //         deleted: new Date().getTime(),
    //     },
    // });

    // res.json({
    //     message: 'success',
    //     data: evt
    // })

    Event.updateOne(
    { _id: req.params.id },
        {
            $set: {
                deleted: new Date().getTime(),
            },
        }
    ).exec((err, result) => {});

    res.json({
        message: 'success'
    })

});

router.post("/update", async function(req, res, next) {
    var evt = await Event.updateOne({ _id: req.body.id }, {
        $set: req.body
    });
    res.json({ message: "success", data: evt });
});

module.exports = router;