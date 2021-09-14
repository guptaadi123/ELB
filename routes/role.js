var express = require("express");
var router = express.Router();
const Role = require("../models/role");
const Service = require("./global_service");
const RoleService = require("../models/service_role");
const mdl_service = require('../models/mdl_service');
const CodeDomain = require("../models/code_domain");
const CodeDomainValues = require("../models/code_domainValues");
const roleModel = require("../models/role");
const userRole = require("../models/user_role");
const User = require("../models/user");

router.post("/getAll", async function(req, res, next) {

    var userrole = await userRole.findOne({ userId: req.body.userId });   
    var rolem = await roleModel.findOne({ _id: userrole.roleId });

    if (rolem.name == 'Super Admin' || rolem.name == 'Admin') {

        var Cr = await Role.find({deleted:null}).sort({ createdAt: -1 });
        res.json({ message: "success", data: Cr });

    }  else {

        var Cr = await Role.find({  deleted: null,create_user: req.body.userId}).sort({ createdAt: -1 });
        res.json({ message: "success", data: Cr });
    }

});

router.post("/create", async function(req, res, next) {
    if (!req.body.deletedby) {
        req.body.deletedby = null;
        req.body.deleted = null;
    }

    var Cr = await Role.create(req.body);

    if (req.body.access && req.body.access.length) {
        for (let i in req.body.access) {
            RoleService.create({
                customName: "",
                roleId: Cr._id,
                serviceId: req.body.access[i],
                create_user: "",
                editedby: "",
                deleted: null,
                deletedby: null,
            },()=>{});
        }
    }

    res.json({ message: "success", data: Cr });
});


router.post("/update", async function(req, res, next) {
    if (!req.body.deletedby) {
        req.body.deletedby = null;
    }
    if (!req.body.deleted) {
        req.body.deleted = null;
    }

    var Crs = await RoleService.find({ roleId: req.body.id }, {serviceId: true});
    var finalD = [];

    for (let i in Crs) {
        if (req.body.access.indexOf(Crs[i].serviceId) == -1) {
            RoleService.find({
                _id: Crs[i]._id
            }).remove((err, remove) => {}).exec((err, result) => {});
        } else {
            finalD.push(Crs[i].serviceId);
        }
    }

    var difference = req.body.access.filter(x => finalD.indexOf(x) === -1);

    if (difference.length) {
        for (let i in difference) {
            RoleService.create({
                customName: "",
                roleId: req.body.id,
                serviceId: difference[i],
                create_user: "",
                editedby: "",
                deleted: null,
                deletedby: null,
            },()=>{})
        }
    }

    var ur = await Role.updateOne({ _id: req.body.id }, {
        $set: req.body
    });
    res.json({ message: "success", data: ur });
});

router.post("/:id", async function(req, res) {
     try {
        var Cr = await Role.findOne({ _id: req.params.id });
        var Crs = await RoleService.find({ roleId: req.params.id }, {serviceId: true});

        var role = await userRole.findOne({ userId: req.body.individual});
        var obj = await RoleService.find({ roleId: role.roleId });
        const serviceids = [];

        for (let i in obj) {
            if (obj[i].serviceId) {
                serviceids.push(obj[i].serviceId);
            }
        }

        var services = await mdl_service.find({ _id: { $in: serviceids }, status: 'active',deleted:null }).lean();
        const finalMenu = [];

        for (let j in services) {
            finalMenu.push(''+services[j]._id);
        }

        // 
        let menuData = await mdl_service.find({ status: 'active', deleted:null }).sort({ createdAt: -1 }).lean();

        for (let i in menuData) {
            for (let k in Crs) {
                if (menuData[i]._id == Crs[k].serviceId) {
                    menuData[i].checked = true;
                }
            }
        }

        Service.createRoleMenuTree(menuData, finalMenu, (menuResponse) => {
            res.json({ message: "success", data: Cr, service: menuResponse });
        });
    } catch(errr) {
        console.log("errr >>", errr);
        res.json({ message: "success", data: [], service: [] });
    }
});

router.delete('/:id', async function(req, res, next) {

    Role.updateOne(
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
});




// Get Role Type
router.post("/getrole/type", async function (req, res, next) {
    let obj = await CodeDomain.findOne({
        code: 'RT',deleted: null
    });
  
    let qusmst = await CodeDomainValues.find({
        codedomain: obj._id,deleted: null,status:"active"
    }).sort({position:1,value:1});

    res.json({ message: "success", data: qusmst });
});

module.exports = router;