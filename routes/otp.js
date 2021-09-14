var express = require("express");
var passwordHash = require("password-hash");
var router = express.Router();
const Individual = require("../models/individual");
const User = require("../models/user");
const Emailaddress = require("../models/email_address");
const OTP = require("../models/otp");
const PhoneBook = require("../models/phone_book");
const OTP_Attempt = require("../models/otp_attempt");

// router.post("/setOTP", async function (req, res, next) {
//     rand = Math.floor(Math.random() * 2000 + 999);
//     var otpsend = {
//         otp_type: req.body.otp_type,
//         otp_medium_type: 'email',
//         otp: rand,
//         otp_expire_ts: '30second',
//         phone_book_id: req.body.phone_book_id,
//         email_add_id: req.body.email_add_id,
//         individual: req.body.individual
//     }
//     var savedOtp = await OTP.create(otpsend);
//     res.json({
//         message: "success",
//         result: savedOtp,
//     });
// });


// router.post("/change-password", async function (req, res, next) {
//     var isExist = await User.findOne({ individual: req.body.individual });
//     const isAuth = passwordHash.verify(req.body.password, isExist.password);
//     if (isAuth) {
//         var otpData = await OTP.findOne({
//             individual: req.body.individual
//         }).sort({ createdAt: -1 });
//         if (otpData.otp == req.body.otp && otpData.otp_type == 'change password') {
//             req.body.password = passwordHash.generate(req.body.newPassword);
//             await User.updateOne({
//                 individual: req.body.individual,
//             }, {
//                 $set: {
//                     password: req.body.password
//                 },
//             })
//             await User.updateOne({
//                 _id: req.body.individual,
//             }, {
//                 $set: {
//                     password: req.body.password
//                 },
//             })
//             res.json({
//                 message: "success",
//             });
//         } else {
//             res.json({ message: "OTP doesnt match" });
//         }
//     } else {
//         res.json({ message: "Current Password is wrong" });
//     }
// });


// router.post("/change-email", async function (req, res, next) {
//     var otpData = await OTP.findOne({ individual: req.body.individual }).sort({ createdAt: -1 })
//     if (otpData.otp == req.body.otp && otpData.otp_type == 'change email') {
//         await Emailaddress.updateOne({
//             individual: req.body.individual,
//         }, {
//             $set: {
//                 email_add: req.body.email
//             },
//         })
//         res.json({
//             message: "success",
//         });
//     } else {
//         res.json({ message: "OTP doesnt match" });
//     }
// });


// router.post("/change-security", async function (req, res, next) {
//     await User.updateOne({
//         individual: req.body.individual,
//     }, {
//         $set: {
//             quetionAns: req.body.quetionAns
//         },
//     })
//     res.json({
//         message: "success",
//     });
// });


// router.post("/get-security", async function (req, res, next) {
//     let obj = await User.findOne({
//         individual: req.body.individual,
//     });
//     res.json({ message: "success", data: obj });
// });


// router.post("/getPhoneBook", async function (req, res, next) {
//     var obj = await PhoneBook.find({ individual: req.body._id });
//     res.json({ message: "success", data: obj });
// });

module.exports = router;