var express = require("express");
var router = express.Router();
const CodeDomainV = require("../models/code_domainValues");
const RelatedDomain = require("../models/related_domain");

// Basically "CodeDomainV" stands for Code Domain Values;

router.get("/getAll/:id", async function(req, res, next) {
    var CdomainV = await CodeDomainV.find({ deleted: null, codedomain: req.params.id }).sort({position:1,value:1});
    res.json({ message: "success", data: CdomainV });
});

router.post("/create", async function(req, res, next) {
    // const isnmExist = await CodeDomainV.findOne({ value: req.body.value ,deleted:null});
    // const iscdExist = await CodeDomainV.findOne({ code: req.body.code,deleted:null});
    // let CdomainV = await CodeDomainV.findOne({ deleted: null, codedomain: req.body.codedomain , position :req.body.position });

    // if(isnmExist) {
    //     res.json({ status:false,message: "CodeDomain Value Already Exist"});
    // } else if(iscdExist) {
    //     res.json({ status:false,message: "CodeDomain Code Already Exist"});
    // } else if(CdomainV) {
    //      res.json({ status:false,message: "This position allready exist" });
    // } else {
        let Cr = await CodeDomainV.create(req.body);
        res.json({ status:true,message: "Created successfully", data: Cr });
    // }   
});

router.get("/:id", async function(req, res, next) {
    var Cr = await CodeDomainV.findOne({ _id: req.params.id });
    res.json({ message: "success", data: Cr });
});

router.delete('/:id', async function(req, res, next) {
    // var CR = await CodeDomainV.updateOne({
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

    CodeDomainV.updateOne(
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
    const isnmExist = await CodeDomainV.findOne({ value: req.body.value ,deleted:null, _id: { $ne : req.body.id}});
    const iscdExist = await CodeDomainV.findOne({ code: req.body.code,deleted:null, _id: { $ne : req.body.id}});
    let CdomainV = await CodeDomainV.findOne({ deleted: null, codedomain: req.body.codedomain , position :req.body.position , _id: { $ne : req.body.id}});

    if(isnmExist) {
        res.json({ status:false,message: "CodeDomain Value Already Exist"});
    } else if(iscdExist) {
        res.json({ status:false,message: "CodeDomain Code Already Exist"});
    } else if(CdomainV) {
        res.json({ status:false,message: "This position allready exist" });
    } else {
        var ur = await CodeDomainV.updateOne({ _id: req.body.id }, {
            $set: req.body
        });
        res.json({ status:true,message: "Updated successfully", data: ur });
    }
});

router.get("/getstateOrCity/:id", async function(req, res, next) {
    var dt = [];
    var CdomainV = await RelatedDomain.find({ codedomain_values1: req.params.id, status: 'active',  deleted: null}).populate('codedomain_values2');
    for (let i = 0; i < CdomainV.length; i++) {
        dt.push(CdomainV[i].codedomain_values2)
    }
    res.json({ message: "success", data: dt });
});

module.exports = router;