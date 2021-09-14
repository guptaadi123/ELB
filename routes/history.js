var express = require("express");
const History = require("../models/history");
var router = express.Router();


router.get("/getAll", async function(req, res, next) {
    var evt = await History.find({ deleted: null }).sort({ createdAt: -1 })
    res.json({ message: "success", data: evt });
});

// getAll Against Individual by sellerType
router.get("/getAll/individual/:id/:sellerType", async function(req, res, next) {
    var evt = await History.find({ deleted: null, individual: req.params.id , parent_entity_name:req.params.sellerType}).populate('individual').sort({ createdAt: -1 })
    res.json({ message: "success", data: evt });
});

// getAll Against Individual
router.get("/getAll/individual/:id", async function(req, res, next) {
    var evt = await History.find({ deleted: null, individual: req.params.id}).populate('individual').sort({ createdAt: -1 })
    res.json({ message: "success", data: evt });
});

// getAll Against product
router.get("/getAll/product/:id", async function(req, res, next) {
    var evt = await History.find({ deleted: null, product: req.params.id }).populate('product').sort({ createdAt: -1 })
    res.json({ message: "success", data: evt });
});

// getAll Against business
router.get("/getAll/business/:id", async function(req, res, next) {
    var evt = await History.find({ deleted: null, business: req.params.id }).populate('business').sort({ createdAt: -1 })
    res.json({ message: "success", data: evt });
});

router.get("/:id", async function(req, res, next) {
    var evt = await History.findOne({ _id: req.params.id });
    res.json({ message: "success", data: evt });

});

router.delete('/:id', async function(req, res, next) {
    var evt = await History.updateOne({
        _id: req.params.id,
    }, {
        $set: {
            deleted: new Date().getTime(),
        },
    });

    res.json({
        message: 'success',
        data: evt
    })
});

module.exports = router;