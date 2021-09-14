const express = require("express");
const router = express.Router();
const Tax = require("../models/tax");

router.get("/getAll", async (req, res, next) => {
    var Cr = await Tax.find({ deleted: null }).sort({ createdAt: -1 });
    res.json({ message: "success", data: Cr });
});

router.post("/create", async (req, res, next) => {
    var Tx = await Tax.create(req.body);
    res.json({ message: "success", data: Tx });
});

router.get("/:id", async (req, res, next) => {
    var Tx = await Tax.findOne({ _id: req.params.id });
    res.json({ message: "success", data: Tx });

});

router.delete('/:id', async (req, res, next) => {
    // Tax.updateOne({
    //     _id: req.params.id,
    // }, {
    //     $set: {
    //         deleted: new Date().getTime(),
    //     },
    // }).exec((err, result) => {});

    // res.json({
    //     message: 'success'
    // });

    Tax.updateOne(
    { _id: req.params.id },
    {
        $set: {
            deleted: new Date().getTime(),
        },
    }).exec((err, result) => {});

    res.json({
        message: 'success'
    })
});

router.post("/update", async (req, res, next) => {
    var Tx = await Tax.updateOne({ _id: req.body.id }, {
        $set: req.body
    });
    res.json({ message: "success", data: Tx });
});

module.exports = router;