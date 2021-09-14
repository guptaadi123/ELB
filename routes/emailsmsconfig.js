const express = require('express');
const router = express.Router();
const userModel = require('../models/user');
const individualModel = require('../models/individual');
const businessModel = require('../models/bussiness');
const emailAddModel = require('../models/email_address');
const roleModel = require('../models/role');
const userRole = require('../models/user_role');
const phoneBook = require('../models/phone_book');
var passwordHash = require("password-hash");
const globalService = require('./global_service');
const CodeDomainValues = require("../models/code_domainValues");
const EmailSmsConfig = require("../models/emailsmsconfirgation");

router.all("/getAll", async function (req, res) {
    
    let userrole = await userRole.findOne({ userId: req.body.id });
    let rolem = await roleModel.findOne({ _id: userrole.roleId });

    if (rolem.name == 'Super Admin' || rolem.name == 'Admin') {
        let obj = await EmailSmsConfig.find({});
        res.json({ message: "success", data: obj });
    } else {
        let obj = await userModel.find({create_user: req.body.id});
        res.json({ message: "success", data: obj });
    }

   
});

router.get("/:id", async function (req, res, next) {
    var obj = await EmailSmsConfig.findOne({_id:req.params.id});
    res.json({ message: "success", data: obj});
});


//############################ UPDATE complete record #########################
router.post("/update", async function (req, res) {
    var emailconfig = await EmailSmsConfig.updateOne({ _id: req.body.id }, {
        $set: req.body
    });       
    res.json({ message: "success", data: emailconfig });

});
//############################ END ###########################################
router.delete("/:id", async function (req, res) {

    console.log("DELETE",req.params.id);
    EmailSmsConfig.updateOne(
    { _id: req.params.id },
    {
        $set: {
            deleted: new Date().getTime(),
        },
    }).exec((err, result) => {});

    res.json({ message: "success"});
});

router.post("/create", async function (req, res) {
    // var EmailSmsConfig = await EmailSmsConfig.create(req.body);
    EmailSmsConfig.create(req.body, ()=>{});    
    res.json({ message: "success" });   
});


module.exports = router;