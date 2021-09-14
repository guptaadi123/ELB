var express = require("express");
const Notes = require("../models/notes");
var router = express.Router();

router.get("/getAll", async function(req, res, next) {
    var evt = await Notes.find({ deleted: null }).sort({ createdAt: -1 })
    res.json({ message: "success", data: evt });
});


// getAll Against Individual by sellerType
router.get("/getAll/individual/:id/:sellerType", async function(req, res, next) {
    console.log("sellerType>>>",req.params.sellerType)
    var evt = await Notes.find({ deleted: null, individual: req.params.id , parent_entity_name:req.params.sellerType}).populate('individual').sort({ createdAt: -1 })
    res.json({ message: "success", data: evt });
});

// getAll Against Individual
router.get("/getAll/individual/:id", async function(req, res, next) {
    var evt = await Notes.find({ deleted: null, individual: req.params.id}).populate('individual')
    res.json({ message: "success", data: evt });
});

// getAll Against product
router.get("/getAll/product/:id", async function(req, res, next) {
    var evt = await Notes.find({ deleted: null, product: req.params.id }).populate('product').sort({ createdAt: -1 })
    res.json({ message: "success", data: evt });
});

// getAll Against business
router.get("/getAll/business/:id", async function(req, res, next) {
    var evt = await Notes.find({ deleted: null, business: req.params.id }).populate('business').sort({ createdAt: -1 })
    res.json({ message: "success", data: evt });
});

router.post("/create", async function(req, res, next) {
    // var eventExist = await Notes.findOne({ note_type: req.body.note_type });
    
    // if(eventExist && eventExist._id){
    //     res.json({ message: "already exist"});
    // }else{
    //     var evt = await Notes.create(req.body);
    //     res.json({ message: "success", data: evt });
    // }

    var evt = await Notes.create(req.body);
    res.json({ message: "success", data: evt });
});

router.get("/:id", async function(req, res, next) {
    var evt = await Notes.findOne({ _id: req.params.id });
    res.json({ message: "success", data: evt });

});

router.delete('/:id', async function(req, res, next) {
    // var evt = await Notes.updateOne({
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

    Notes.updateOne(
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
    var evt = await Notes.updateOne({ _id: req.body.id }, {
        $set: req.body
    });
    res.json({ message: "success", data: evt });
});


module.exports = router;