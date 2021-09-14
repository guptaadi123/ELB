var express = require("express");
var router = express.Router();
const CodeDomain = require("../models/code_domain");
const CodeDomainValues = require("../models/code_domainValues");


router.get("/getAll", async function(req, res, next) {
    let finalData = [];
    var Cr = await CodeDomain.find({ deleted: null }).lean().sort({ createdAt: -1 });
    for(let i in Cr){
        var fetch = await CodeDomainValues.count({ deleted: null, codedomain: Cr[i]._id });
        Cr[i].count = fetch
    }

    res.json({ message: "success", data: Cr });
});

router.post("/create", async function(req, res, next) {
    const isnmExist = await CodeDomain.findOne({ name: req.body.name ,deleted:null});
    const iscdExist = await CodeDomain.findOne({ code: req.body.code,deleted:null});
    
    if(isnmExist) {
        res.json({ status:false,message: "CodeDomain Name Already Exist"});
    } else if(iscdExist) {
        res.json({ status:false,message: "CodeDomain Code Already Exist"});
    } else {
        var Cr = await CodeDomain.create(req.body);
        res.json({ status:true,message: "Code domain Created successfully", data: Cr });
    }
});

router.get("/:id", async function(req, res, next) { 
    console.log("hello");
    var Cr = await CodeDomain.findOne({deleted: null, _id: req.params.id });
    var check = await CodeDomain.findOne({ deleted: null, status : 'active', code: 'CDMN_TYPE' });
    var fetch = await CodeDomainValues.find({ status : 'active', deleted: null, codedomain: check }).sort({position:1,value:1});
    
    var check1 = await CodeDomain.findOne({ deleted: null, status : 'active', code: 'STS' });
    var fetch1 = await CodeDomainValues.find({ status : 'active', deleted: null, codedomain: check1 }).sort({position:1,value:1});

    res.json({ message: "success", data: Cr, domainTypes: fetch, statusList: fetch1 });
});

router.delete('/:id', async function(req, res, next) {
    // var CR = await CodeDomain.updateOne({
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

    CodeDomain.updateOne(
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
    const isnmExist = await CodeDomain.findOne({ name: req.body.name,deleted:null, _id: { $ne : req.body.id}});
    const iscdExist = await CodeDomain.findOne({ code: req.body.code,deleted:null, _id: { $ne : req.body.id}});

    if(isnmExist) {
        res.json({ status:false, message: "CodeDomain Name Already Exist"});
    } else if(iscdExist) {
        res.json({ status:false, message: "CodeDomain Code Already Exist"});
    } else {
         var ur = await CodeDomain.updateOne({ _id: req.body.id }, {
            $set: req.body
        });
        res.json({status:true, message: "Updated successfully",data: ur });
    }
});


// get Data through code domain code
router.get("/fetch/countries", async function(req, res, next) {
    var check = await CodeDomain.findOne({deleted: null, code: 'CNTRY' });
    var fetch = await CodeDomainValues.find({ deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

// get active_countries
router.get("/fetch/active_countries", async function(req, res, next) {
    var check = await CodeDomain.findOne({deleted: null, status : 'active', code: 'CNTRY' });
    var fetch = await CodeDomainValues.find({ status : 'active', deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

// get Data through code domain code
router.get("/fetch/industry", async function(req, res, next) {
    var check = await CodeDomain.findOne({deleted: null, code: 'TBI' });
    var fetch = await CodeDomainValues.find({ deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

router.get("/fetch/state", async function(req, res, next) {
    var check = await CodeDomain.findOne({deleted: null, code: 'STTE' });
    var fetch = await CodeDomainValues.find({ deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

router.get("/fetch/city", async function(req, res, next) {
    var check = await CodeDomain.findOne({deleted: null, code: 'CTY' });
    var fetch = await CodeDomainValues.find({ deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

router.get("/fetch/bussiness_type", async function(req, res, next) {
    var check = await CodeDomain.findOne({deleted: null, code: 'BSTYP' });
    var fetch = await CodeDomainValues.find({ deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

router.get("/fetch/bussiness_ownership", async function(req, res, next) {
    var check = await CodeDomain.findOne({deleted: null, code: 'TYP' });
    var fetch = await CodeDomainValues.find({ deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

router.get("/fetch/salutation", async function(req, res, next) {
    var check = await CodeDomain.findOne({deleted: null, code: 'SALTT' });
    var fetch = await CodeDomainValues.find({ deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

router.get("/fetch/job_function", async function(req, res, next) {
    var check = await CodeDomain.findOne({deleted: null, code: 'JBF' });
    var fetch = await CodeDomainValues.find({ deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

router.get("/fetch/department", async function(req, res, next) {
    var check = await CodeDomain.findOne({deleted: null, code: 'DPT' });
    var fetch = await CodeDomainValues.find({ deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

router.get("/fetch/status", async function(req, res, next) {
    var check = await CodeDomain.findOne({deleted: null, code: 'STUS' });
    var fetch = await CodeDomainValues.find({ deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

router.get("/fetch/market_type", async function(req, res, next) {
    var check = await CodeDomain.findOne({deleted: null, code: 'MKTTYP' });
    var fetch = await CodeDomainValues.find({ deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

router.get("/fetch/colour_pallet", async function(req, res, next) {
    var check = await CodeDomain.findOne({deleted: null, code: 'CLRPLT' });
    var fetch = await CodeDomainValues.find({ deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

router.get("/fetch/lenght", async function(req, res, next) {
    var check = await CodeDomain.findOne({deleted: null, code: 'ULGM' });
    var fetch = await CodeDomainValues.find({ deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

router.get("/fetch/weight", async function(req, res, next) {
    var check = await CodeDomain.findOne({deleted: null, code: 'UWGM' });
    var fetch = await CodeDomainValues.find({ deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

router.get("/fetch/packaging_type", async function(req, res, next) {
    var check = await CodeDomain.findOne({deleted: null, code: 'PKTYP' });
    var fetch = await CodeDomainValues.find({ deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

router.get("/fetch/visibility", async function(req, res, next) {
    var check = await CodeDomain.findOne({deleted: null, code: 'VSB' });
    var fetch = await CodeDomainValues.find({ deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

router.get("/fetch/Business_Type", async function(req, res, next) {
    var check = await CodeDomain.findOne({deleted: null, code: 'BSTYP' });
    var fetch = await CodeDomainValues.find({ deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

router.get("/fetch/turnoverLastThreeYears", async function(req, res, next) {
    var check = await CodeDomain.findOne({deleted: null, code: 'TL3Y' });
    var fetch = await CodeDomainValues.find({ deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

module.exports = router;
