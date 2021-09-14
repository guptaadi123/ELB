const express = require('express');
const router = express.Router();
const comm_history = require('../models/comm_history');
const communication_compositions = require('../models/comm_compositions');

router.get("/getAll", async function(req, res) {
    var obj = await comm_history.find().sort({ createdAt: -1 });  
    // var obj1 = await communication_compositions.find({_id: obj.composition_id});
    
    res.json({ message: "success", data: obj });
});

router.get("/:id", async function(req, res, next) {   
    var Cr = await comm_history.findOne({ _id: req.params.id });
    res.json({ message: "success", data: Cr });
});

router.post("/create", async function(req, res, next) {
    var Cr = await comm_history.create(req.body);
    res.json({ message: "success", data: Cr });
});

module.exports = router;