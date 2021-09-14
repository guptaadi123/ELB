var nodemailer = require("nodemailer");
const EmailSmsConfig = require("../models/emailsmsconfirgation");

var passwordSend = function(email, password) {
   

    var transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true, //ssl
        // auth: {
        //     user: 'expoteam1039@gmail.com',
        //     pass: 'Expo$123'
        // },
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
            "</b>,<br> Your account password is :- <b style='color:grey;font-size:17px;margin-left:30px'>" +
            password +
            '</b>',
    };

    transporter.sendMail(mailOptions, function(err, info) {
        if (err)
            console.log("error Helooooo",err)
        else
            console.log('Email Sent');
    });

};


// var eventTempSend = function(emailTemplate,userDetails) {

//     let userData = Object.keys(userDetails);

//     for (let i in userData) {
//         emailTemplate.body = emailTemplate.body.replace('{{'+userData[i]+'}}', userDetails[userData[i]]);
//     }  
  
//     var transporter = nodemailer.createTransport({
//         host: 'smtp.zoho.com',
//         port: 465,
//         secure: true, //ssl
//         // auth: {
//         //     user: 'expoteam1039@gmail.com',
//         //     pass: 'Expo$123'
//         // },
//         auth: {
//             user: 'notification@vendyhq.com',
//             pass: 'vendy#$_2021'
//         },
//         tls: {
//             rejectUnauthorized: false
//         }
//     });
//     let mailOptions = {      
//         from: emailTemplate.from,
//         to: emailTemplate.to,
//         subject: emailTemplate.subject,
//         html: emailTemplate.body,
//     };

//     transporter.sendMail(mailOptions, function(err, info) {
//         if (err)
//             console.log("error Helooooo",err)
//         else
//             console.log('Email Sent');
//     });

// };


exports.eventTempSend = async (emailTemplate,userDetails,body, cb) => {
    let configSetting = await EmailSmsConfig.findOne({status:"active"});
    var transporter = nodemailer.createTransport({
        host: configSetting.host,
        port: configSetting.port,
        secureConnection: false,
        auth: {
            user: configSetting.userName,
            pass: configSetting.password
        },
        tls: {
            rejectUnauthorized: false 
        }
    });

    emailTemplate.body = '<div style="text-align:center;width:100%;"><img src="cid:uniq-mailtrap.jpg" alt="mailtrap" /></div>'+ emailTemplate.body;

    let mailOptions = {
        // from: emailTemplate.from,
        from: configSetting.from,
        // to: emailTemplate.to,
        to: userDetails.email_add,
        // to: "rajnikantujariya2016@gmail.com",
        subject: emailTemplate.subject,
        html: emailTemplate.body,
        attachments: [
        {
          filename: 'mailtrap.png',
          path: __dirname + '/../public/expo-logo.jpg',
          cid: 'uniq-mailtrap.jpg'
        }
      ]
    };

    transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
            console.log("error Helooooo",err)
            cb(false);
        } else {
            console.log('Email Sent');
            cb(true);
        }   
    });
      // eventTempSend(eventTemplate,userDetails);      
       
}

// module.exports = { passwordSend,eventTempSend};
// module.exports = { passwordSend };