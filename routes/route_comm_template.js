const express = require('express');
const router = express.Router();
const mdl_comm_template = require('../models/mdl_comm_template');
const CodeDomain = require("../models/code_domain");
const CodeDomainValue = require("../models/code_domainValues");

router.get("/getAll", async function(req, res) {
    var obj = await mdl_comm_template.find().populate('parent_id').sort({ createdAt: -1 });
    res.json({ message: "success", data: obj });
});

router.get("/:id", async function(req, res, next) {
    //var Cr = await mdl_comm_template.findOne({ _id: req.params.id }).populate('parent_id');
    var Cr = await mdl_comm_template.findOne({ _id: req.params.id });
    res.json({ message: "success", data: Cr });
});

//############################ UPDATE complete record #########################
router.post("/update", async function(req, res) {
    var obj = await mdl_comm_template.updateOne({ _id: req.body.id }, {
        $set: req.body
    });
    res.json({ message: "success", data: obj });
});
//############################ END ###########################################
router.delete("/:id", async function(req, res) {
    // var CR = await mdl_comm_template.updateOne({
    //     _id: req.params.id,
    // }, {
    //     $set: {
    //         deleted: new Date().getTime(),
    //     },
    // });

    mdl_comm_template.updateOne(
    { _id: req.params.id },
    {
        $set: {
            deleted: new Date().getTime(),
        },
    }
    ).exec((err, result) => {});
  
    res.json('deleted');
});

router.post("/create", async function(req, res) {
    var isExist = await mdl_comm_template.findOne({ name: req.body.name });
    if (isExist) {
        res.json({ message: "already" });
    } else {
        var result = await mdl_comm_template.create(req.body);
        res.json({ message: "success", data: result });
    }
});

router.get("/", async function(req, res) {
    res.send('hello from communication template');
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

module.exports = router;