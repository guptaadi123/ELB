var nodemailer = require("nodemailer");

var dynamicEmail = function(email, code) {
    var transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true, //ssl
        auth: {
            user: 'notification@vendyhq.com',
            pass: 'vendy#$_2021'
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    let mailOptions = {
        from: 'Notifications" <notification@vendyhq.com>',
        to: email,
        subject: 'You got a verification code by Expo.com',
        html: "<b style='color:#33b17d;font-size:17px'>" +
            "</b>,<br> Your email verification code is :- <b style='color:grey;font-size:17px;margin-left:30px'>" +
            code +
            '</b>',
    };

    transporter.sendMail(mailOptions, function(err, info) {
        if (err)
            console.log(err)
        else
            console.log('Email Sent');
    });
};

module.exports = { dynamicEmail };

