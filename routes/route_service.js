const express = require('express');
const router = express.Router();
const mdl_service = require('../models/mdl_service');
const CodeDomain = require("../models/code_domain");
const CodeDomainValues = require("../models/code_domainValues");
const ServiceCodeDomainValue = require("../models/service_code_domain_value");


router.get("/getAll", async function (req, res) {
    let obj = await mdl_service.find({deleted:null}).populate('parent_id').lean().sort({ createdAt: -1 });
    res.json({ message: "success", data: obj });
});

// Work Flow Status
router.get("/getWorkFlowStatus", async function (req, res, next) {
    var check = await CodeDomain.findOne({ code: 'WRK_STS' });
    var fetch = await CodeDomainValues.find({ status: 'active', deleted: null, codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

// Page Wise Work Flow Status
router.post("/getByPageWFS", async function (req, res, next) {
    const Cr = await mdl_service.findOne({ route: req.body.route }, { _id: true, name: true });

    if (Cr && Cr._id) {
        const work_flow_status = await ServiceCodeDomainValue.find({ serviceId: Cr._id }, { code_domain_value: true, serviceId: true, code_domain: true }).populate('code_domain').sort({ createdAt: -1 });

        let data = []

        if (work_flow_status.length) {
            for (let i in work_flow_status) {
                data.push(work_flow_status[i].code_domain_value);
            }
            res.json({ message: "success", data: data });
        } else {
            res.json({ message: "success", data: data });
        }
    } else {
        res.json({ message: "success", data: [] });
    }
});



router.get("/getAll1", async function (req, res) {
    let obj = await mdl_service.find({}).lean().sort({ createdAt: -1 });

    const list_to_tree = (list) => {
        var map = {}, node, roots = [], i;

        for (i = 0; i < list.length; i += 1) {
            map[list[i]._id] = i; // initialize the map
            list[i].children = []; // initialize the children
        }

        for (i = 0; i < list.length; i += 1) {
            node = list[i];

            if (node.parent_id) {
                try {
                    list[map[node.parent_id]].children.push(node);
                } catch (err) {

                }
            } else {
                roots.push(node);
            }
        }

        return roots;
    }

    let service = list_to_tree(obj);

    res.json({ message: "success", data: service });
});

router.get("/:id", async function (req, res, next) {
    const Cr = await mdl_service.findOne({ _id: req.params.id }).lean();
    const work_flow_status = await ServiceCodeDomainValue.find({ serviceId: req.params.id });
    Cr.work_flow_status = work_flow_status;
    if (work_flow_status.length) {
        Cr.code_domain = work_flow_status[0].code_domain;
    }
    if (Cr.parent_id) {
        const PS = await mdl_service.findOne({ _id: Cr.parent_id });
        Cr.service = PS;
    }
    res.json({ message: "success", data: Cr });
});

//############################ UPDATE complete record #########################
router.post("/update", async function (req, res) {
    if (req.body.deleteArray.length) {
        for (let k in req.body.deleteArray) {
            ServiceCodeDomainValue.deleteOne({ _id: req.body.deleteArray[k]._id }).exec((err, result) => {});
        }
    }

    if (req.body.serviceFormArray && req.body.serviceFormArray.length) {
        for (let i in req.body.serviceFormArray) {
            if (req.body.serviceFormArray[i]._id != '') {
                ServiceCodeDomainValue.updateOne({ _id: req.body.serviceFormArray[i]._id }, {
                    $set: req.body.serviceFormArray[i]
                }).exec((err, result) => {});
            } else {
                if (req.body.serviceFormArray[i].code_domain_value != '') {
                    delete req.body.serviceFormArray[i]._id
                    ServiceCodeDomainValue.create(req.body.serviceFormArray[i],()=>{});
                }
            }
        }
    }

    // const data = await mdl_service.find({});

    // for (let i in data) {
    //     let row = data[i].name.toLowerCase();
    //     row = row.replace(/ /g,'-');
    //     console.log("row >>", row);
    //     const obj = await mdl_service.updateOne({ _id: data[i]._id }, {
    //         $set: {
    //             service_code: row
    //         }
    //     });

    // }

    

    const obj = await mdl_service.updateOne({ _id: req.body.id }, {
        $set: req.body
    });

    res.json({ message: "success", data: obj });
});

//############################ END ###########################################
router.delete("/:id", async function (req, res) {   

    // var CR = await mdl_service.updateOne({
    //     _id: req.params.id,
    // }, {
    //     $set: {
    //         deleted: new Date().getTime(),
    //     },
    // });

    mdl_service.updateOne(
    { _id: req.params.id },
    {
        $set: {
            deleted: new Date().getTime(),
        },
    }).exec((err, result) => {});

    res.json('deleted');
});

router.post("/create", async function (req, res) {


    const isExist = await mdl_service.findOne({ name: req.body.name, parent_id: req.body.parent_id });

    if (isExist) {
        res.json({ message: "already" });
    } else {
        const result = await mdl_service.create(req.body);

        if (req.body.serviceFormArray && req.body.serviceFormArray.length) {
            for (let i in req.body.serviceFormArray) {
                req.body.serviceFormArray[i].serviceId = result._id;
                delete req.body.serviceFormArray[i]._id
                // await ServiceCodeDomainValue.create(req.body.serviceFormArray[i]);
                ServiceCodeDomainValue.create(req.body.serviceFormArray[i],() =>{
                    
                });
            }
        }

        res.json({ message: "success", data: result });
    }
});


// get All market-place
router.get("/getRelationdomain/type", async function (req, res) { 
  var check = await CodeDomain.findOne({ code: "SRT",status:"active" , deleted: null});
  var fetch = await CodeDomainValues.find({ deleted: null, codedomain: check,status:"active" }).sort({position:1,value:1});  
  res.json({ message: "success",data: fetch });
});


module.exports = router;