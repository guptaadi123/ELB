var express = require("express");
const Hsn = require("../models/Hsn");
var router = express.Router();
const HSN= require("../models/Hsn");

router.get("/getAll", async function(req, res, next) {
    var hsn = await Hsn.find({ deleted: null }).populate('taxid');
   // var RL = await RelaitedDomain.find({ deleted: null }).populate('codedomain1 codedomain_values1 codedomain2 codedomain_values2 ');
    res.json({ message: "success", data: hsn });
});

router.post("/create",async function(req,res,next){
    var hsn = await Hsn.create(req.body);
    res.json({message:"success",data:hsn});

});

router.get("/:id",async function(req,res,next){
    var hsn = await Hsn.findOne({_id:req.params.id});
    res.json({ message: "success", data: hsn});

});

router.delete('/:id', async function(req, res, next) {
    // var hsn = await Hsn.updateOne({
    //     _id: req.params.id,
    // }, {
    //     $set: {
    //         deleted: new Date().getTime(),
    //     },
    // });

    // res.json({
    //     message: 'success',
    //     data: hsn
    // })

    Hsn.updateOne(
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
    var hsn = await Hsn.updateOne({ _id: req.body.id }, {
        $set: req.body
    });
    res.json({ message: "success", data: hsn });
});
module.exports = router;


