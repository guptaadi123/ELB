const express = require("express");
const router = express.Router();
const sellerstory = require("../models/sellerstory");
const Media = require("../models/media");
const roleModel = require('../models/role');
const userRole = require('../models/user_role');
const USAssignment = require("../models/user_service_assignment");


router.get("/getAll", async function(req, res, next) {
    const Ss = await sellerstory.find({ deleted: null }).sort({ createdAt: -1 });
    res.json({ message: "success", data: Ss });
});

router.get("/getApprovalStatus", async function(req, res, next) {
    const Ss = await sellerstory.find({ deleted: null,status: 'SubmitForApproval'}).sort({ createdAt: -1 });
    res.json({ message: "success", data: Ss });
});

router.post("/getpendingStatus", async function(req, res, next) {

    var userrole = await userRole.findOne({ userId: req.body.userId });
    var rolem = await roleModel.findOne({ _id: userrole.roleId });

    if (rolem.name == 'Super Admin' && req.body.pageName == "brandqcapproval") {
        var status = await sellerstory.find({ deleted: null, "status":'SubmitForApproval'}).sort({ createdAt: -1 });     
    }  else if (rolem.name == 'Super Admin' && req.body.pageName == "sellerstory") {
        var status = await sellerstory.find({ deleted: null, "status":{$ne:'Approved'}}).sort({ createdAt: -1 }); 
    } else {

        let srvassignList = await USAssignment.find(
            { deleted: null , assing_user_id : req.body.userId,parent_entity_name:"Individual"}
        ).sort({ createdAt: -1 });
        let ii = [];
        for (let i in srvassignList) {
          ii.push(srvassignList[i].parent_entity_id);
        }

        var status = await sellerstory.find({ deleted: null, "status":{$ne:'Approved'}, $or: [{ individual: req.body.userId }, { individual: {$in:ii} }]}).sort({ createdAt: -1 });
    }

    res.json({ message: "success", data: status });
});

router.post("/create", async function(req, res, next) {
    let count = 0;
    console.log("req.bodyreq.body",req.body);
    const loop = async ()=> {
        if (count < req.body.length) {
            var result = await sellerstory.create(req.body[count]);
            req.body[count].images.parent_entity_id = result._id;

            count += 1;
            loop();
        } else {
            for(let i in req.body){
                Media.create(req.body[i].images);
            }
            res.json({ message: "success", data: req.body });
        }
    }
    loop();
});

router.get("/:id", async function(req, res, next) {
    let Ss = await sellerstory.findOne({ _id: req.params.id }).lean();
    const img = await Media.findOne({ parent_entity_id: req.params.id });
    Ss.images = img;
    
    res.json({ message: "success", data: Ss });
});

router.delete('/:id', async function(req, res, next) {
    // const Ss = await sellerstory.updateOne({
    //     _id: req.params.id,
    // }, {
    //     $set: {
    //         deleted: new Date().getTime(),
    //     },
    // });

    sellerstory.updateOne(
    { _id: req.params.id },
        {
            $set: {
                deleted: new Date().getTime(),
            },
        }
    ).exec((err, result) => {});

    res.json({
        message: 'success'
    });
});

router.post("/update", async function(req, res, next) {

    if(req.body[0].status == '') {
        let Ss = await sellerstory.findOne({ _id: req.body[0].id });
        req.body[0].status = Ss.status;
    }

    const ur = await sellerstory.updateOne({ _id: req.body[0].id }, {
        $set: req.body[0]
    });

    Media.updateOne({ parent_entity_id: req.body[0].id }, {
        $set: req.body[0].images
    });

    res.json({ message: "success", data: ur });
});

router.post("/updatestatus", async function(req, res, next) {
    const ur = await sellerstory.updateMany({ status: 'SubmitForApproval' }, {
        $set: {
            status: 'Approved'
        }
    });
    res.json({ message: "success", data: ur });
});




router.post("/updatesubforappStatus", async function(req, res, next) {   
    sellerstory.updateOne({ _id: req.body.id }, {
        $set: { status: req.body.status }
    }).exec((err, result) => {});

    res.json({ message: "success", data: [] });
});

module.exports = router;