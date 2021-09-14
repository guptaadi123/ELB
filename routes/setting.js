var express = require("express");
var passwordHash = require("password-hash");
var router = express.Router();
const Individual = require("../models/individual");
const User = require("../models/user");
const Emailaddress = require("../models/email_address");
const OTP = require("../models/otp");
const PhoneBook = require("../models/phone_book");
const OTP_Attempt = require("../models/otp_attempt");
const Bussiness = require("../models/bussiness");
const CodeDomain = require("../models/code_domain");
const CodeDomainValue = require("../models/code_domainValues");
const marketplace_country = require("../models/marketplace_countries");
const media = require("../models/media");
const CommunicationHistory = require("../models/comm_history");
const globalService = require('./global_service');

// All setting of set OTP
router.post("/setOTP", async function (req, res, next) {

    var emilExist = await Emailaddress.findOne({
        individual: {$ne: req.body.individual},
        email_add: req.body.newEmail.toLowerCase()
    });

    if (emilExist && emilExist._id) {
        return res.json({
            status: false,
            message: "Email ID already exists.",
        });
    }

    if (req.body.status == 'resend') {
        var fetch = OTP.deleteMany({
            otp_type: req.body.otp_type,
            otp_medium_type: 'email',
            phone_book_id: req.body.phone_book_id,
            email_add_id: req.body.email_add_id,
            individual: req.body.individual
        }).exec((err, result) => {});
    }

    let rand = Math.floor(Math.random() * 2000 + 999);

    globalService.saveOtp({
        otp_type: req.body.otp_type,
        otp_medium_type: 'email',
        otp: rand,
        phone_book_id: req.body.phone_book_id,
        email_add_id: req.body.email_add_id,
        individual: req.body.individual
    });

    let body = {
        userId: req.body.individual,
        otp: rand,
    };

    globalService.emailTemplateSend("Change Email OTP",body,(eventTemplate) => {
        res.json({
            status: true,
            message: "OTP Sent Successfully",
            // data: data,
        });
    });
});

// Change Password
router.post("/change-password", async function (req, res, next) {

    var isExist = await User.findOne({ individual: req.body.individual });
    const isAuth = passwordHash.verify(req.body.password, isExist.password);
    if (isAuth) {
        req.body.password = passwordHash.generate(req.body.newPassword);
        User.updateOne({
            individual: req.body.individual,
        }, {
            $set: {
                password: req.body.password
            },
        }).exec((err, result) => {});
        User.updateOne({
            _id: req.body.individual,
        }, {
            $set: {
                password: req.body.password
            },
        }).exec((err, result) => {});
        res.json({
            message: "success",
        });
    } else {
        res.json({ message: "Current Password is wrong" });
    }
});

// Change Email
router.post("/change-email", async function (req, res, next) {
    var emilExist = await Emailaddress.findOne({
        individual: {$ne: req.body.individual},
        email_add: req.body.email.toLowerCase()
    });

    if (emilExist && emilExist._id) {
        res.json({
            status: false,
            message: "Email ID already exists.",
        });
        return;
    }

    var otpData = await OTP.findOne({ individual: req.body.individual, otp_type: 'change email' });

    if (!otpData) {
        return res.json({ 
            status: false,
            message: "OTP not valid"
        });
    }

    if (new Date(otpData.otp_expire_ts) < new Date()) {
     return res.json({
      status: false,
      message: "OTP is expired!",
    });
   }
        
    if (otpData.otp == req.body.otp && otpData.otp_type == 'change email') {
        Emailaddress.updateOne({
            individual: req.body.individual,
            code: "RGEM"
        }, {
            $set: {
                email_add: req.body.email
            },
        }).exec((err, result) => {
        });

        Emailaddress.updateOne({
            individual: req.body.individual,
            code: "BSEM"
        }, {
            $set: {
                email_add: req.body.email
            },
        }).exec((err, result) => {
        });

        User.updateOne({
            individual: req.body.individual,
        }, {
            $set: {
                username: req.body.email
            },
        }).exec((err, result) => {});

        res.json({
            status: true,
            message: "Your Email changed successfully",
        });
    } else {
        res.json({ 
            status: false,
            message: "OTP doesnt match"
        });
    }
});

// Change Security
router.post("/change-security", async function (req, res, next) {
    User.updateOne({
        individual: req.body.individual,
    }, {
        $set: {
            quetionAns: req.body.quetionAns
        },
    }).exec((err, result) => {});
    res.json({
        message: "success",
    });
});

// Get Security Master
router.post("/get-securitymst", async function (req, res, next) {
    let obj = await CodeDomain.findOne({
        code: 'SQ',
    });

    let qusmst = await CodeDomainValue.find({
        codedomain: obj._id,status:"active"
    }).sort({position:1,value:1});

    res.json({ message: "success", data: qusmst });
});

// Get Security
router.post("/get-security", async function (req, res, next) {
    let obj = await User.findOne({
        individual: req.body.individual,
    });
    res.json({ message: "success", data: obj });
});

// Get Phone Book
router.post("/getPhoneBook", async function (req, res, next) {
    var obj = await PhoneBook.find({ individual: req.body._id });
    res.json({ message: "success", data: obj });
});

// Get Wish Receive
router.post("/wish-receive/get", async function (req, res, next) {
    var obj = await Bussiness.findOne({
        individual: req.body.individual,
    }, {
        add_notification: true,
        update_notification: true,
        delete_notification: true,
        approve_notification: true,
        reject_notification: true,
        pref_comm_sms: true,
        pref_comm_email: true,
        pref_comm_notification: true,
    })
    res.json({ message: "success", data: obj });
});

// Update Wish Receive
router.post("/wish-receive/update", async function (req, res, next) {
    Bussiness.updateOne({
        individual: req.body.individual,
    }, req.body).exec((err, result) => {});
    res.json({ message: "success" });
});

//############################ Marketplace Countries ###########################################

// get Country
router.post("/fetch/countries", async function (req, res, next) {
    var check = await CodeDomain.findOne({ code: 'CNTRY' });
    var fetch = await CodeDomainValue.find({ deleted: null,status:"active", codedomain: check }).sort({position:1,value:1});
    res.json({ message: "success", data: fetch });
});

// get All market-place
router.get("/get-market-place", async function (req, res) {
    var obj = await marketplace_country.find().sort({ createdAt: -1 });
    res.json({ message: "success", data: obj });
});

// get By ID
router.get("/getByIdmarket/:id", async function (req, res, next) {
    var obj = await marketplace_country.findOne({ _id: req.params.id }).lean();
    var img = await media.find({ parent_entity_id: req.params.id });
    obj.images = img
    res.json({ message: "success", data: obj });
});

// Create marketplace
router.post("/create-marketplace", async function (req, res) {
    var result = await marketplace_country.create(req.body);
    res.json({
        message: "success",
        data: result
    });

    for (let i in req.body.images) {
        req.body.images[i].parent_entity_id = result._id
        media.create(req.body.images[i],()=>{});
    }

});

// update marketplace
router.post("/update-marketplace", async function (req, res) {
    var obj = await marketplace_country.updateOne({ _id: req.body.id }, {
        $set: req.body
    });

    media.deleteMany({ parent_entity_id: req.body.id }).exec((err, result) => {});

    for (let i in req.body.images) {
        req.body.images[i].parent_entity_id = req.body.id
        media.create(req.body.images[i],()=>{});
    }
    res.json({ message: "success", data: obj });

});

// delete marketplace
router.delete("/delete-marketplace/:id", async function (req, res) {
    // marketplace_country.deleteOne({ _id: req.params.id }).exec((err, result) => {});
    // media.deleteMany({ parent_entity_id: req.params.id }).exec((err, result) => {});
    marketplace_country.updateOne(
    { _id: req.params.id },
    {
        $set: {
            deleted: new Date().getTime(),
        },
    }
    ).exec((err, result) => {});

    media.updateMany(
    { parent_entity_id: req.params.id },
    {
        $set: {
            deleted: new Date().getTime(),
        },
    }
    ).exec((err, result) => {});


    res.json('deleted');
});


router.post("/get-notification", async function (req, res, next) {    
    let obj = await CommunicationHistory.find({
        parent_entity_id: req.body.individual,medium:"Notification"
    }).sort({ createdAt: -1 });
    
    res.json({ message: "success", data: obj });
});

router.post("/get-notification-count", async function (req, res, next) {
    let count = await CommunicationHistory.count({
        parent_entity_id: req.body.individual,
        medium:"Notification",
        read_timestamp: null
    });
    
    res.json(count);
});

router.post("/read-notification", async function (req, res, next) {
    const ur = await CommunicationHistory.updateMany({
        parent_entity_id: req.body.individual,
        medium: "Notification",
        read_timestamp: null
    }, {
        $set: {
            read_timestamp: new Date().getTime()
        }
    });

    res.json({ message: "success"});
});

//############################ END ###########################################






// router.post("/get-security", async function (req, res, next) {
//     // var obj = await User.find({individual: req.body.individual}).lean()
//     // .populate({ 
//     //     path: 'individual',select: 'firstname lastname middlename',
//     //     populate: {
//     //         path: 'email_address',select: 'email_add',
//     //     } 
//     // });

//     var obj = await User.findOne({individual: req.body.individual}).lean()
//     .populate({ 
//         path: 'individual',select: 'firstname lastname middlename',
//         populate: {
//             path: 'email_address',select: 'email_add',
//         } 
//     });
//     obj.firstname = obj.individual.firstname;
//     obj.lastname = obj.individual.lastname;
//     obj.middlename = obj.individual.middlename;
//     obj.email = obj.individual.email_address.email_add;

//     delete obj.individual;

//     res.json({ message: "success", data: obj });
// });

module.exports = router;