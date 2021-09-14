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
// const { passwordSend } = require("./passwordsend");


router.get("/reportingTo", async function (req, res) {

    let obj = await CodeDomainValues.findOne({
        code: 'Backend',deleted: null
    });

    let userroleList = await roleModel.find({roleType:obj._id , status:"active" , deleted : null});
   
    let rollId = [];
    for (let i in userroleList) {
        rollId.push(userroleList[i]._id);
    }

    let userRollList = await userRole.find({ roleId: { $in: rollId }});

    let userId = [];
    for (let j in userRollList) {
        userId.push(userRollList[j].userId);
    }

    let userList = await individualModel.find({ _id: { $in: userId }}).collation({locale: "en" }).sort( { "firstname": 1 } );

    res.json({ message: "success", userList: userList });
});


router.all("/getAll", async function (req, res) {
    console.log(req.session.user);
    var userrole = await userRole.findOne({ userId: req.body.id });
    var rolem = await roleModel.findOne({ _id: userrole.roleId });

    if (rolem.name == 'Super Admin' || rolem.name == 'Admin') {
        var obj = await userModel.find({}).lean().sort({ createdAt: -1 })
        .populate({
            path: 'individual',
            populate: {
                path: 'email_address',
            }
        });
    } else {

        var obj = await userModel.find({$or:[{create_user: req.body.id},{parent_user:req.body.id}]}).lean()
        .populate({
            path: 'individual',
            populate: {
                path: 'email_address',
            }
        });
    }

    var roleData = await userRole.find({});

    let ids = [];
    for (let k in obj) {
        for (let j in roleData) {
            if (obj[k].individual) {
                if (roleData[j].userId == obj[k].individual._id) {
                    ids.push(roleData[j].roleId);
                    obj[k].roleID = roleData[j].roleId;
                }
            }
        }
    }

    var rolesData = await roleModel.find({ _id: {$in:ids} }, {name: true});

    for (let i in rolesData) {
        for (let j in obj) {
            if (rolesData[i]._id == obj[j].roleID) {
                obj[j].roleName = rolesData[i].name;
            }
        }
    }

    res.json({ message: "success", data: obj });
});

router.get("/:id", async function (req, res, next) {

    var obj = await userModel.findOne({ _id: req.params.id }).lean()
        .populate({
            path: 'individual',
            populate: {
                path: 'email_address',
            }
        });

    if (obj) {
        if (obj.individual) {
            var userrole = await userRole.findOne({ userId: obj.individual._id });
            if (userrole) {
                obj.role = userrole.roleId;
            }
            var usercontact = await phoneBook.findOne({ individual: obj.individual._id });
            if (usercontact) {
                obj.phone_number = usercontact.phone_number;
            }
        }
    }

    // For Selected Reporting To
    if (obj) {
        if (obj.parent_user) {
            const reportUser = await individualModel.findOne({ _id: obj.parent_user });
            if(reportUser) {
                obj.reportto = reportUser._id;
            }            
        }
    }

    // For Role List
    var roles = await roleModel.find({ status: 'active', deleted: null }, { name: true });

    let obj1 = await CodeDomainValues.findOne({
        code: 'Backend',deleted: null
    });

    let userroleList = await roleModel.find({roleType:obj1._id , status:"active" , deleted : null});
   
    let rollId = [];
    for (let i in userroleList) {
        rollId.push(userroleList[i]._id);
    }

    let userRollList = await userRole.find({ roleId: { $in: rollId }});

    let userId = [];
    for (let j in userRollList) {
        userId.push(userRollList[j].userId);
    }

    let userList = await individualModel.find({ _id: { $in: userId }}).collation({locale: "en" }).sort( { "firstname": 1 } );

    res.json({ message: "success", data: obj, roles: roles, userList: userList });
});


//############################ UPDATE complete record #########################
router.post("/update", async function (req, res) {

    var checkuser = await userModel.findOne({ _id: req.body.id ,deletedby : null});

    const isExist = await emailAddModel.findOne({ email_type: 'personal', code: 'RGEM', email_add: req.body.email_add,deletedby : null , individual: { $ne : checkuser.individual}});
    const isExistphoneNo = await phoneBook.findOne({ phone_number: req.body.phone_number,deletedby : null, phone_type: 'personal', code: 'RGPH' , individual: { $ne : checkuser.individual}});
    if(isExist) {
        res.json({ message: "already"});
    }
    else if(isExistphoneNo){
        res.json({ message: "alreadymobile"});
    } else {
        var user = await userModel.findOneAndUpdate({ _id: req.body.id }, {
            "username": req.body.username,
            "parent_user": req.body.reportto,
            "descreption": req.body.descreption,
        });
    
        var individual = await individualModel.findOneAndUpdate({ _id: user.individual }, {
            "firstname": req.body.firstname,
            "lastname": req.body.lastname,
            "middlename": req.body.middlename,
        });
    
        var emailAdd = await emailAddModel.findOneAndUpdate({ _id: individual.email_address }, {
            "email_add": req.body.email_add,
            "status": req.body.status,
        });
        
        const userroled = await userRole.findOne({ userId: user.individual });
        
        if (userroled && userroled._id) {
            userRole.findOneAndUpdate({ userId: user.individual }, {
                "roleId": req.body.role,
            }).exec((err, result) => {});
        } else {
            userRole.create({
                "userId": user.individual,
                "roleId": req.body.role,
                "startDate": null,
                "endDate": null,
            },()=>{});
        }
    
        phoneBook.findOneAndUpdate({ individual: user.individual }, {
            "phone_number": req.body.phone_number,
        }).exec((err, result) => {});
       
        res.json({ message: "success", data: user });

    }

});
//############################ END ###########################################
router.delete("/:id", async function (req, res) {
    const userDetail = await userModel.findOne({ _id: req.params.id });

    // userModel.deleteOne({ _id: req.params.id }).exec((err, result) => {});
    // userRole.deleteOne({ userId: userDetail.individual }).exec((err, result) => {});
    // individualModel.deleteOne({ _id: userDetail.individual }).exec((err, result) => {});
    // emailAddModel.deleteOne({ individual: userDetail.individual }).exec((err, result) => {});
    // phoneBook.deleteOne({ individual: userDetail.individual }).exec((err, result) => {});

    userModel.updateOne(
    { _id: req.params.id },
    {
        $set: {
            deleted: new Date().getTime(),
        },
    }).exec((err, result) => {});

    userRole.updateOne(
    { userId: userDetail.individual },
    {
        $set: {
            deleted: new Date().getTime(),
        },
    }).exec((err, result) => {});

    individualModel.updateOne(
    { _id: userDetail.individual },
    {
        $set: {
            deleted: new Date().getTime(),
        },
    }).exec((err, result) => {});

    emailAddModel.updateOne(
    { individual: userDetail.individual },
    {
        $set: {
            deleted: new Date().getTime(),
        },
    }).exec((err, result) => {});

    phoneBook.updateOne(
    { individual: userDetail.individual },
    {
        $set: {
            deleted: new Date().getTime(),
        },
    }).exec((err, result) => {});


    res.json('deleted');
});

router.post("/create", async function (req, res) {

    const isExist = await emailAddModel.findOne({ email_add: req.body.email_add,deletedby : null,email_type: 'personal', code: 'RGEM' });
    const isExistMobile = await phoneBook.findOne({ phone_number: req.body.phone_number,deletedby : null, phone_type: 'personal', code: 'RGPH'});
    
    if(isExist) {
        res.json({ message: "Email ID already exists."});
    } else if(isExistMobile) {
        res.json({ message: "Mobile number already exists."});
    } else {
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        var string_length = 8;
        var randomstring = '';
        
        for (var i = 0; i < string_length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum, rnum + 1);
        }
    
        req.body.password = passwordHash.generate(randomstring);
    
        var emailAdd = await emailAddModel.create({
            "email_type": "personal",
            "email_add": req.body.email_add,
            "status": req.body.status,
            "create_user": null,
            "individual": null,
            "code": "RGEM",
        });
    
        var individual = await individualModel.create({
            "firstname": req.body.firstname,
            "lastname": req.body.lastname,
            "middlename": req.body.middlename,
            "password": req.body.password,
            "email_address": emailAdd._id,
            "phonebook": null
        });
    
        userModel.create({
            "individual": individual._id,
            "username": req.body.username,
            "password": req.body.password,
            "parent_user": req.body.reportto,
            "descreption": req.body.descreption,
            "create_user": req.body.create_user,
        }, ()=>{});
    
        userRole.create({
            "userId": individual._id,
            "roleId": req.body.role,
            "startDate": null,
            "endDate": null,
        },()=>{});
    
        phoneBook.create({
            "phone_type": "personal",
            "entity_type": "mobile",
            "countery_code": "",
            "status": req.body.status,
            "create_user": individual._id,
            "code": "",
            "otpVerified": "No",
            "individual": individual._id,
            "phone_number": req.body.phone_number,
        }, ()=>{});
    
        emailAddModel.updateOne({ _id: emailAdd._id }, {
            $set: {
                individual: individual._id,
                create_user: individual._id
            }
        }).exec((err, result) => {});

        // Rajnikant Start Code
        let body = {
            userId:individual._id,
            password:randomstring
        }
        globalService.emailTemplateSend('User Management Password', body, (eventTemplate)=> {
           res.json({ message: "success"});
        });
        // Rajnikant End Code
    
        res.json({ message: "success" });
    }
});


//############################ UPDATE Business Information #########################

router.post("/updateBussInfo", async function (req, res) {

    var busUpdate = await businessModel.findOneAndUpdate({ individual: req.body._id }, {
        "custome_order_flag": req.body.custome_order_flag,
        "hsn_code_flag": req.body.hsn_code_flag,
        "manufacturer_flag": req.body.manufacturer_flag,
        "trademark_flag": req.body.trademark_flag,
    });

    res.json({ message: "success", data: busUpdate });
});


router.post("/getAllBusiness", async function (req, res, next) {
    var obj = await businessModel.findOne({ individual: req.body._id });
    res.json({ message: "success", data: obj });
});

module.exports = router;