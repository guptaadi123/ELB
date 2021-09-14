const express = require('express');
const router = express.Router();
const comm_compositions = require('../models/comm_compositions');
const CodeDomain = require("../models/code_domain");
const CodeDomainValue = require("../models/code_domainValues");

router.get("/getAll", async function(req, res) {
    var obj = await comm_compositions.find().populate('parent_id');
    res.json({ message: "success", data: obj });
});

router.get("/:id", async function(req, res, next) {
    var Cr = await comm_compositions.findOne({ _id: req.params.id });
    res.json({ message: "success", data: Cr });
});

//############################ UPDATE complete record #########################
router.post("/update", async function(req, res) {
    var obj = await comm_compositions.updateOne({ _id: req.body.id }, {
        $set: req.body
    });
    res.json({ message: "success", data: obj });
});

//############################ END ###########################################
router.delete("/:id", async function(req, res) {
    // comm_compositions.deleteOne({ _id: req.params.id }).exec((err, result) => {});
    // res.json('deleted');

    comm_compositions.updateOne(
        { _id: req.params.id },
        {
            $set: {
                deleted: new Date().getTime(),
            },
        }
    ).exec((err, result) => {});

    res.json('deleted')
});

router.post("/create", async function(req, res) {
    var isExist = await comm_compositions.findOne({ name: req.body.name });
    if (isExist) {
        res.json({ message: "already" });
    } else {
        var result = await comm_compositions.create(req.body);
        res.json({ message: "success", data: result });
    }
});

router.get("/", async function(req, res) {
    res.send('hello from communication compositions');
});

// Get Varaible  
router.post("/get-variables", async function (req, res, next) {
    let obj = await CodeDomain.findOne({
        code: 'CTV',deleted: null
    });
   
    let qusmst = await CodeDomainValue.find({
        codedomain: obj._id,deleted: null,status:"active"
    }).sort({position:1,value:1});
    res.json({ message: "success", data: qusmst });
});

// Get Template Event Name
router.post("/get-eventName", async function (req, res, next) {
    let obj = await CodeDomain.findOne({
        code: 'CTE',deleted: null
    });

    let qusmst = await CodeDomainValue.find({
        codedomain: obj._id,deleted: null,status:"active"
    }).sort({position:1,value:1});

    res.json({ message: "success", data: qusmst });
});

module.exports = router;
