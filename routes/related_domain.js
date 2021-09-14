var express = require("express");
var router = express.Router();
const CodeDomain = require("../models/code_domain");
const CodeDomainvalues = require("../models/code_domainValues");
const RelaitedDomain = require("../models/related_domain");

router.get("/getAll", async function(req, res, next) {
    var RL = await RelaitedDomain.find({ deleted: null }).populate('codedomain1 codedomain_values1 codedomain2 codedomain_values2 ').sort({ createdAt: -1 });
    res.json({ message: "success", data: RL });
});

router.post("/create", async function(req, res, next) {
    var Cr = await RelaitedDomain.create(req.body);
    res.json({ message: "success", data: Cr });
});

router.get("/:id", async function(req, res, next) {
    var Cr = await RelaitedDomain.findOne({ _id: req.params.id }).populate('codedomain1 codedomain_values1 codedomain2 codedomain_values2 ');
    res.json({ message: "success", data: Cr });
});

router.delete('/:id', async function(req, res, next) {
    // var CR = await RelaitedDomain.updateOne({
    //     _id: req.params.id,
    // }, {
    //     $set: {
    //         deleted: new Date().getTime(),
    //     },
    // });

    // res.json({
    //     message: 'success',
    //     data: CR
    // })

    RelaitedDomain.updateOne(
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

})

router.post("/update", async function(req, res, next) {
    var ur = await RelaitedDomain.updateOne({ _id: req.body.id }, {
        $set: req.body
    });
    res.json({ message: "success", data: ur });
});


module.exports = router;