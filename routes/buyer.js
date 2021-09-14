var express = require("express");
var router = express.Router();
const SignUp = require("../models/buyer_signup");
const passwordHash = require("password-hash");
const globalService = require("./global_service");
const jwt = require("jsonwebtoken");
const Product = require("../models/product");
const Category = require("../models/category");
const Media = require("../models/media");

// Buyer signup 
router.post("/create", async function (req, res) {
    var isExistEmail = await SignUp.findOne({ emailID: req.body.emailID });
    var isExistphone = await SignUp.findOne({ mobile: req.body.mobile });

    if (isExistEmail && isExistphone) {
        res.json({ message: "Email id and Mobile Number already exists" });
    }
    else if (isExistphone) {
        res.json({ message: "Mobile Number is already exists" });
    }
    else if (isExistEmail) {
        res.json({ message: "Email id is already exists" });
    }
    else {
        rand = Math.floor(Math.random() * 2000 + 999);
        req.body.password = passwordHash.generate(req.body.password);
        let register = await SignUp.create(req.body);
        let body = {
            userId: register._id,
            otp: rand,
        };
        globalService.emailTemplateSend("Buyer Register OTP", body, (eventTemplate) => { });
        res.json({ message: "success", data: register, code: rand, });
    }
});

// Buyer signup Remaing field upadate
router.post("/update", async function (req, res) {
    console.log('req.body', req.body);
    req.body.password = passwordHash.generate(req.body.password);
    let reg = await SignUp.updateOne({ _id: req.body.id }, {
        $set: req.body
    });
    res.json({ message: "success", data: reg });
});

// OTP Verfication Buyer
router.post("/otpVerficationBuyer", async function (req, res) {
    SignUp.updateOne({ _id: req.body.id }, {
        $set: { buyer_status: req.body.buyer_status },
    }).exec((err, result) => { });

    res.json({ message: "success" });
});

//resend OTP
router.post("/resendOTP", async function (req, res) {
    let rand = Math.floor(Math.random() * 2000 + 999);

    var isExist = await SignUp.findOne({ emailID: req.body.emailID });
    console.log('isExist', isExist);

    if (isExist) {
        let body = {
            userId: isExist._id,
            otp: rand,
        };
        globalService.emailTemplateSend("Resend Otp", body, (eventTemplate) => { });

        return res.json({
            message: "success",
            code: rand,
        });
    } else {
        res.json({ message: "Un Authorized" });
    }
});

// signin
router.post("/signin", async function (req, res) {
    let isExist = await SignUp.findOne({ emailID: req.body.email }).sort({
        createdAt: -1,
    });

    if (isExist && isExist.seller_status == "NVA") {
        res.json({ message: "OTP panding" });
        return true;
    }
    if (isExist) {
        let data = {
            emailID: isExist.emailID,
            firstName: isExist.firstName,
            lastName: isExist.lastName,
            mobile: isExist.mobile,
            buyer_status: isExist.buyer_status,
        }
        const isAuth = passwordHash.verify(req.body.password, isExist.password);
        if (isAuth) {
            const token = jwt.sign({ _id: req.body.email, id: isExist._id },
                "hello",
                { expiresIn: "365d" });
            // globalService.attampLogin(req, ind, (attampLogin) => {});

            return res.json({
                token: token,
                data: data,
                message: "success",
                //   code: rand,
            });
        } else {
            // Login Attand
            // globalService.attampLogin(req, {}, (attampLogin) => {});

            res.json({ message: "Un Authorized" });
        }
    } else {
        res.json({ message: "Un Authorized" });
    }
    // res.json({ message: "success" });
});

// forget Passward Otp
router.post("/forgetPasswardOtp", async function (req, res) {
    let rand = Math.floor(Math.random() * 2000 + 999);

    let isExist = await SignUp.findOne({ emailID: req.body.email }).sort({
        createdAt: -1,
    });

    if (isExist) {
        let body = {
            userId: isExist._id,
            otp: rand,
        };

        globalService.emailTemplateSend("Forgot Password", body, (eventTemplate) => { });

        return res.json({
            message: "success",
            code: rand,
        });
    } else {
        res.json({ message: "Un Authorized" });
    }
});

// Reset Password 
router.post("/reset/password", async function (req, res) {
    req.body.password = passwordHash.generate(req.body.password);

    let isExist = await SignUp.findOne({ emailID: req.body.email }).sort({
        createdAt: -1,
    });

    SignUp.updateOne({ _id: isExist._id },
        {
            $set: { password: req.body.password },
        }).exec((err, result) => { });

    res.json({ message: "success" });
});

//  get Product By Category Id
router.get("/getProductByCategoryId/:id", async function (req, res) {
    let Pro = await Product.find({ "categories.category": req.params.id }).lean();
    let pids = [];
    for (let i in Pro) {
        pids.push(Pro[i]._id);
    }

    var media = await Media.find({ product: { $in: pids } });

    for (let i in Pro) {
        Pro[i].images = [];
        for (let k in media) {
            if ('' + media[k].product == '' + Pro[i]._id) {
                Pro[i].images.push(media[k]);
            }
        }
    }
    res.json({ message: "success", data: Pro });
});

//  get Product By Id
router.get("/getProductId/:id", async function (req, res) {
    let Pro = await Product.findOne({ _id: req.params.id, deleted: null }).lean();
    var MD = await Media.find({ product: req.params.id });
    Pro.images = MD

    res.json({ message: "success", data: Pro });
});

module.exports = router;
