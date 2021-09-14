const express = require("express");
const router = express.Router();
const Category = require("../models/category");
const CodeDomainValues = require("../models/code_domainValues");
const CommunicationComposition = require("../models/comm_compositions");
const CommunicationHistory = require("../models/comm_history");
const Individual = require("../models/individual");
const eventTemp = require("./passwordsend");
const User = require("../models/user");
const useragent = require('express-useragent')
const login_attempt = require('../models/login_attempt');
const otp_attempt = require('../models/otp_attempt');
const user_session = require('../models/user_session');
const OTP = require("../models/otp");
const CodeDomain = require("../models/code_domain");
const mdl_service = require('../models/mdl_service');
const ServiceCodeDomainValue = require("../models/service_code_domain_value");
const Bussiness = require("../models/bussiness");

exports.getCat = async (data, cb) => {
  var cats = await Category.find({ status: 'active', deleted: null }).lean().sort({ createdAt: -1 });
  let catList = [];
  
  for (let i in data) {
      for (let j in cats) {
          if(data[i].category == cats[j]._id){
              catList.push(cats[j]);
          }
      }
  }

  const list_to_tree = (list) => {
      var map = {}, node, roots = [], i;
      for (i = 0; i < list.length; i += 1) {
          map[list[i]._id] = i; // initialize the map
          list[i].children = []; // initialize the children
      }
      for (i = 0; i < list.length; i += 1) {
          node = list[i];
          node.text = node.name;
          node.value = node._id;
          node.collapsed = true;
          
          if (!node.checked) {
              node.checked = false;
          }
          if (node.parent) {
              try {
                  if (list[map[node.parent]].children) {
                      list[map[node.parent]].children.push(node);
                  }
              } catch (erer) {
                  console.log("catch >>>> ", node.parent);
              }
          } else {
              roots.push(node);
          }
      }
      return roots;
  }
  let service = await list_to_tree(catList);
  cb({
      category: cats,
      finalList: service
  });
}

// Sidemenu tree view (Data management)
exports.sideMenuDataMgmt = async (datas, resp, cb) => {
  let finalMenu = [];

  const list_to_tree = (list) => {
      var map = {}, node, roots = [], i;

      for (i = 0; i < list.length; i += 1) {
          map[list[i]._id] = i;
          list[i].submenu = [];
      }

      for (i = 0; i < list.length; i += 1) {
          node = list[i];

          if (node.parent_id) {
              try {
                  if (list[map[node.parent_id]].submenu) {
                      list[map[node.parent_id]].submenu.push(node);
                  }
              } catch (erer) {
                  console.log("catch >>>> ", node.parent_id);
              }
          } else {
              roots.push(node);
          }
      }

      return roots;
  }

  let data = await list_to_tree(datas);

  // Main menu filter
  for (let i in data) {
      if (resp.indexOf(data[i]._id.toString()) == -1) {
        data[i].found = false;
      } else {
        data[i].found = true;
      }
  }

  // Level 1 filter
  for (let i in data) {
      if (data[i].submenu) {
        for (let k in data[i].submenu) {
          if (resp.indexOf(data[i].submenu[k]._id.toString()) == -1) {
            data[i].submenu[k].found = false;
          } else {
            data[i].submenu[k].found = true;
            data[i].found = true;
          }
        }
      } else {
        data[i].found = false;
      }
  }

  // Level 2 filter
  for (let i in data) {
      if (data[i].submenu) {
        for (let k in data[i].submenu) {
          if (resp.indexOf(data[i].submenu[k]._id.toString()) == -1) {
            data[i].submenu[k].found = false;
          } else {
            data[i].submenu[k].found = true;
            data[i].found = true;
          }

          if (data[i].submenu[k].submenu) {
              for (let k2 in data[i].submenu[k].submenu) {
                  if (resp.indexOf(data[i].submenu[k].submenu[k2]._id.toString()) == -1) {
                    data[i].submenu[k].submenu[k2].found = false;
                  } else {
                    data[i].submenu[k].submenu[k2].found = true;
                    data[i].submenu[k].found = true;
                    data[i].found = true;
                  }

                  if (data[i].submenu[k].submenu[k2].submenu) {
                      for (let k3 in data[i].submenu[k].submenu[k2].submenu) {
                          if (resp.indexOf(data[i].submenu[k].submenu[k2].submenu[k3]._id.toString()) == -1) {
                            data[i].submenu[k].submenu[k2].submenu[k3].found = false;
                          } else {
                            data[i].submenu[k].submenu[k2].submenu[k3].found = true;
                            data[i].submenu[k].found = true;
                            data[i].submenu[k].submenu[k2].found = true;
                            data[i].found = true;
                          }

                          if (data[i].submenu[k].submenu[k2].submenu[k3].submenu) {
                              for (let k4 in data[i].submenu[k].submenu[k2].submenu[k3].submenu) {
                                  if (resp.indexOf(data[i].submenu[k].submenu[k2].submenu[k3].submenu[k4]._id.toString()) == -1) {
                                    data[i].submenu[k].submenu[k2].submenu[k3].submenu[k4].found = false;
                                  } else {
                                    data[i].submenu[k].submenu[k2].submenu[k3].submenu[k4].found = true;
                                    data[i].submenu[k].found = true;
                                    data[i].submenu[k].submenu[k2].found = true;
                                    data[i].submenu[k].submenu[k2].submenu[k3].found = true;
                                    data[i].found = true;
                                  }
                              }
                          }
                      }
                  }
              }
          }
        }
      } else {
        data[i].found = false;
      }
  }

  let dd = {};
  let dd1 = {};
  let dd2 = {};
  let dd3 = {};

  for (let i in data) {
      if (data[i].found) {
        
        dd = JSON.parse(JSON.stringify(data[i]));
        dd['submenu'] = [];

        if (data[i].submenu) {
          for (let l1 in data[i].submenu) {
            if (data[i].submenu[l1].found) {
              
              dd1 = JSON.parse(JSON.stringify(data[i].submenu[l1]));
              dd1['submenu'] = [];

              if (data[i].submenu[l1].submenu) {
                for (let l2 in data[i].submenu[l1].submenu) {
                  if (data[i].submenu[l1].submenu[l2].found) {
                      
                      dd2 = JSON.parse(JSON.stringify(data[i].submenu[l1].submenu[l2]));
                      dd2['submenu'] = [];

                      if (data[i].submenu[l1].submenu[l2].submenu) {
                        for (let l3 in data[i].submenu[l1].submenu[l2].submenu) {
                          if (data[i].submenu[l1].submenu[l2].submenu[l3].found) {
                            dd2['submenu'].push(data[i].submenu[l1].submenu[l2].submenu[l3]);
                          }
                        }
                      }

                      dd1['submenu'].push(dd2);
                  }
                }
              }
              dd['submenu'].push(dd1);
            }
          }
        }
        if (!dd.parent_id) {
          finalMenu.push(dd);
        }
      }
  }


  cb(finalMenu);
}


// Nalin code
exports.createRoleMenuTree = async (datas, resp, cb) => {

  let finalMenu = [];

  const list_to_tree = (list) => {
      var map = {}, node, roots = [], i;

      for (i = 0; i < list.length; i += 1) {
          map[list[i]._id] = i;
          list[i].submenu = [];
      }

      for (i = 0; i < list.length; i += 1) {
          node = list[i];
          node.text = node.name;
          node.value = node._id;
          node.collapsed = true;

          if (!node.checked) {
              node.checked = false;
          }

          if (node.parent_id) {
              try {
                  if (list[map[node.parent_id]].submenu) {
                      list[map[node.parent_id]].submenu.push(node);
                  }
              } catch (erer) {
                  // console.log("catch >>>> ", node.parent_id);
              }
          } else {
              roots.push(node);
          }
      }

      return roots;
  }

  let data = await list_to_tree(datas);

  // Main menu filter
  for (let i in data) {
      if (resp.indexOf(data[i]._id.toString()) == -1) {
        data[i].found = false;
      } else {
        data[i].found = true;
      }
  }

  // Level 1 filter
  for (let i in data) {
      if (data[i].submenu) {
        for (let k in data[i].submenu) {
          if (resp.indexOf(data[i].submenu[k]._id.toString()) == -1) {
            data[i].submenu[k].found = false;
          } else {
            data[i].submenu[k].found = true;
            data[i].found = true;
          }
        }
      } else {
        data[i].found = false;
      }
  }

  // Level 2 filter
  for (let i in data) {
      if (data[i].submenu) {
        for (let k in data[i].submenu) {
          if (resp.indexOf(data[i].submenu[k]._id.toString()) == -1) {
            data[i].submenu[k].found = false;
          } else {
            data[i].submenu[k].found = true;
            data[i].found = true;
          }

          if (data[i].submenu[k].submenu) {
              for (let k2 in data[i].submenu[k].submenu) {
                  if (resp.indexOf(data[i].submenu[k].submenu[k2]._id.toString()) == -1) {
                    data[i].submenu[k].submenu[k2].found = false;
                  } else {
                    data[i].submenu[k].submenu[k2].found = true;
                    data[i].submenu[k].found = true;
                    data[i].found = true;
                  }

                  if (data[i].submenu[k].submenu[k2].submenu) {
                      for (let k3 in data[i].submenu[k].submenu[k2].submenu) {
                          if (resp.indexOf(data[i].submenu[k].submenu[k2].submenu[k3]._id.toString()) == -1) {
                            data[i].submenu[k].submenu[k2].submenu[k3].found = false;
                          } else {
                            data[i].submenu[k].submenu[k2].submenu[k3].found = true;
                            data[i].submenu[k].found = true;
                            data[i].submenu[k].submenu[k2].found = true;
                            data[i].found = true;
                          }

                          if (data[i].submenu[k].submenu[k2].submenu[k3].submenu) {
                              for (let k4 in data[i].submenu[k].submenu[k2].submenu[k3].submenu) {
                                  if (resp.indexOf(data[i].submenu[k].submenu[k2].submenu[k3].submenu[k4]._id.toString()) == -1) {
                                    data[i].submenu[k].submenu[k2].submenu[k3].submenu[k4].found = false;
                                  } else {
                                    data[i].submenu[k].submenu[k2].submenu[k3].submenu[k4].found = true;
                                    data[i].submenu[k].found = true;
                                    data[i].submenu[k].submenu[k2].found = true;
                                    data[i].submenu[k].submenu[k2].submenu[k3].found = true;
                                    data[i].found = true;
                                  }
                              }
                          }
                      }
                  }
              }
          }
        }
      } else {
        data[i].found = false;
      }
  }

  let dd = {};
  let dd1 = {};
  let dd2 = {};
  let dd3 = {};

    for (let i in data) {
      if (data[i].found) {
        
        dd = JSON.parse(JSON.stringify(data[i]));
        dd['children'] = [];

        if (data[i].submenu) {
          for (let l1 in data[i].submenu) {
            if (data[i].submenu[l1].found) {
              
              dd1 = JSON.parse(JSON.stringify(data[i].submenu[l1]));
              dd1['children'] = [];

              if (data[i].submenu[l1].submenu) {
                for (let l2 in data[i].submenu[l1].submenu) {
                  if (data[i].submenu[l1].submenu[l2].found) {
                      
                      dd2 = JSON.parse(JSON.stringify(data[i].submenu[l1].submenu[l2]));
                      dd2['children'] = [];

                      if (data[i].submenu[l1].submenu[l2].submenu) {
                        for (let l3 in data[i].submenu[l1].submenu[l2].submenu) {
                          if (data[i].submenu[l1].submenu[l2].submenu[l3].found) {
                            dd2['children'].push(data[i].submenu[l1].submenu[l2].submenu[l3]);
                          }
                        }
                      }

                      dd1['children'].push(dd2);
                  }
                }
              }
              dd['children'].push(dd1);
            }
          }
        }
        if (!dd.parent_id) {
          finalMenu.push(dd);
        }
      }
  }

  cb(finalMenu);
}


// Email Template Send
exports.emailTemplateSend = async (eventName, body, cb) => {

     
      var check = await CodeDomain.findOne({ code: 'CTE' });
      var obj = await CodeDomainValues.findOne({ code: eventName,deleted: null,status:"active", codedomain: check });


      if(obj) {

           var getnotsetting = await CodeDomain.findOne({ code: 'CTE' });


          let emailTemplate = await CommunicationComposition.findOne({
              event_to_send: obj._id,medium:"Email",deletedby:null
          });

          let notificationTemplate = await CommunicationComposition.findOne({
              event_to_send: obj._id,medium:"Notification",deletedby:null
          });

          let userDetails = await Individual.findOne({ deleted: null,_id:body.userId }).populate('phonebook email_address').lean();

          var prefCommAlerts = await Bussiness.findOne({
            individual: userDetails._id,
            }, {
                add_notification: true,
                update_notification: true,
                delete_notification: true,
                approve_notification: true,
                reject_notification: true,
                pref_comm_sms: true,
                pref_comm_email: true,
                pref_comm_notification: true,
            });

          let forceotpsend = ['Resend Otp', 'Seller Register OTP', 'Forgot Password'];

          if (forceotpsend.indexOf(eventName) != -1) {
            prefCommAlerts = {
              pref_comm_email: 'Yes'
            };
          }
            
          if(prefCommAlerts){
            if(userDetails.email_address) {
               userDetails.email_add = userDetails.email_address.email_add;
            } else {
               userDetails.email_add = '';
            }
  
            if(userDetails.phonebook) {
               userDetails.phone_number = userDetails.phonebook.phone_number;
            } else {
               userDetails.phone_number = '';
            }
          
            let user = await User.findOne({ deleted: null,individual:body.userId });       
            if(user){
              userDetails.username  = user.username;
            }
  
            let userData = Object.keys(userDetails);
  
           if(getnotsetting.Email == true) {
  
  
           }

           if(prefCommAlerts.pref_comm_notification == 'Yes'){
             if (notificationTemplate) {
                 for (let i in userData) {
                   notificationTemplate.body = notificationTemplate.body.replace('{{'+userData[i]+'}}', userDetails[userData[i]]);
                 }    
   
                 if(body.hasOwnProperty('password')) {        
                   notificationTemplate.body = notificationTemplate.body.replace('{{newpassword}}', body.password);
                 }
   
                 if(body.hasOwnProperty('otp')) {
                    notificationTemplate.body = notificationTemplate.body.replace('{{otp}}', body.otp);
                 }
   
                 CommunicationHistory.create({
                     "composition_id": notificationTemplate._id,
                     "parent_entity_name": userDetails.firstname + ' ' + userDetails.middlename + ' ' + userDetails.lastname,
                     "parent_entity_id": userDetails._id,
                     "from": notificationTemplate.from,
                     "to": notificationTemplate.to,
                     "cc": notificationTemplate.cc,
                     "bcc": notificationTemplate.bcc,
                     "subject": notificationTemplate.subject,
                     "body": notificationTemplate.body,
                     "medium": notificationTemplate.medium,
                     "alert_type": notificationTemplate.alert_type,
                     "service_id": notificationTemplate.template_id,
                     "communication_compose_id": notificationTemplate._id
                 },()=>{});
             }
           }else{
            cb(true);
           }

           if(prefCommAlerts.pref_comm_email == 'Yes'){
             if(emailTemplate) {
   
               for (let i in userData) {
                 emailTemplate.body = emailTemplate.body.replace('{{'+userData[i]+'}}', userDetails[userData[i]]);
               }    
   
               if(body.hasOwnProperty('password')) {        
                 emailTemplate.body = emailTemplate.body.replace('{{newpassword}}', body.password);
               }
   
               if(body.hasOwnProperty('otp')) {
                  emailTemplate.body = emailTemplate.body.replace('{{otp}}', body.otp);
               }
   
     
               CommunicationHistory.create({
                   "composition_id": emailTemplate._id,
                   "parent_entity_name": userDetails.firstname + ' ' + userDetails.middlename + ' ' + userDetails.lastname,
                   "parent_entity_id": userDetails._id,
                   "from": emailTemplate.from,
                   "to": emailTemplate.to,
                   "cc": emailTemplate.cc,
                   "bcc": emailTemplate.bcc,
                   "subject": emailTemplate.subject,
                   "body": emailTemplate.body,
                   "medium": emailTemplate.medium,
                   "alert_type": emailTemplate.alert_type,
                   "service_id": emailTemplate.template_id,
                   "communication_compose_id": emailTemplate._id
               },()=>{});

               eventTemp.eventTempSend(emailTemplate,userDetails,body, (sendEmail)=> {           
                 cb(sendEmail);
               });
             } else {
               cb(true);
             }
           }else{
            cb(true);
           }
            
          }

      } else {
         cb(true);
      }
     
      // eventTempSend(eventTemplate,userDetails);      
       
}

// Email Template Send
exports.attampLogin = async (req,userData, cb) => {
    let ip = require("ip");
    let source = req.headers['user-agent'],
    ua = useragent.parse(source);


    if(userData) {

      let loginattempt = {
        userId: userData._id,
        source_type: ua.source,
        ipaddress: ip.address(),
        client_type: ua.browser,
        username: userData.firstname + " " + userData.lastname,
        status: 'active',
        create_user: userData._id,
        deleted: null,
        editedby:null,
        deletedby:null
      };

      let logattan = await login_attempt.create(loginattempt);


      let otpDetails = {
        otp_type: "",
        otp_medium_type: "",
        otp: "",
        otp_expire_ts: "",
        phone_book_id: "",
        email_add_id: "",
        status: 'active',
        create_user: userData._id,
        individual:userData._id,
        login_attemp:logattan._id,
        deleted: null,
        editedby:null,
        deletedby:null
      };

      let otp = await OTP.create(otpDetails);


      let otpAtt = {
        otp_entered: "",
        otp: otp._id,
        status: 'active',
        create_user: userData._id,
        deleted: null,
        editedby:null,
        deletedby:null
      };

      let otpatt = await otp_attempt.create(otpAtt);

      let sessionData = {       
        status: 'active',
        create_user: userData._id,
        login_attemp:logattan._id,
        otp_attemp:otpatt._id,
        deleted: null,
        editedby:null,
        deletedby:null
      };

      user_session.create(sessionData,()=>{});

    } else {
      let loginattempt = {
        userId: null,
        source_type: ua.source,
        ipaddress: ip.address(),
        client_type: ua.browser,
        username: '',
        status: 'active',
        create_user: null,
        deleted: null,
        editedby:null,
        deletedby:null
      };

      login_attempt.create(loginattempt,()=>{});      
    }
}


exports.getByPageWFS = async (req, cb) => {
    const Cr = await mdl_service.findOne({ route: req.body.route }, { _id: true, name: true });

    if (Cr && Cr._id) {
        const work_flow_status = await ServiceCodeDomainValue.find({ serviceId: Cr._id }, { code_domain_value: true, serviceId: true, code_domain: true }).populate('code_domain');

        let data = []

        if (work_flow_status.length) {
            for (let i in work_flow_status) {
                data.push(work_flow_status[i].code_domain_value);
            }
            cb(data);
        } else {
            cb(data);
        }
    } else {
        cb([]);
    }
};


exports.getAll = async (req, cb) => {
    
  // var userrole = await userRole.findOne({ userId: req.body.userId });
  // var rolem = await roleModel.findOne({ _id: userrole.roleId });

  // if (rolem.name == 'Super Admin' || rolem.name == 'Admin') {

  //     globalService.getByPageWFS(req, async (keyList) => {
  //            let ii = [];
  //       var ur = await Individual.find({
  //         deleted: null,
  //         seller_status: { $in: keyList },
  //       })
  //       .populate("phonebook email_address")
  //       .lean();

  //       for (let i in ur) {
  //         ii.push(ur[i]._id);
  //       }

  //       // New 
        
  //          var assign = await USAssignment.find(
  //           { parent_entity_id: { $in: ii } },
  //           { keyidentifier_value: true, parent_entity_id: true }
  //         );

  //         for (let i in ur) {
  //           for (let as in assign) {
  //             if (assign[as].parent_entity_id == ur[i]._id) {
  //               ur[i].assignTo = assign[as].keyidentifier_value;
  //             }
  //           }
  //         }

  //       // New End

  //       var bus = await Bussiness.find(
  //         { individual: { $in: ii } },
  //         { bus_name: true }
  //       );

  //       for (let i in ur) {
  //         for (let j in bus) {
  //           if (bus[j].bus_name && bus[j].individual == ur[i]._id) {
  //             ur[i].bus_name = bus[j].bus_name;
  //           }
  //         }
  //       }
  //       res.json({ message: "success", data: ur });
  //     });
     

  // } else {
  //   // req.body.showunassignuser = false;
  //   if(req.body.showunassignuser) {

  //       globalService.getByPageWFS(req, async (keyList) => {


  //     let assignuserList = [];
  //     let srvassignList = await serviceAssign.find(
  //       { deleted: null}
  //     );

  //     for (let i in srvassignList) {
  //         assignuserList.push(srvassignList[i].parent_entity_id);
  //     }


  //     if (req.body && req.body.individual) {
  //       var ur = await Individual.find({
  //         _id: req.body.individual,
  //         deleted: null,
  //         seller_status: { $in: keyList },
  //         // _id: { $nin: assignuserList },


  //       })
  //         .populate("phonebook email_address")
  //         .lean();
  //     } else {
  //       var ur = await Individual.find({
  //         deleted: null,
  //         seller_status: { $in: keyList },
  //         // _id: { $nin: assignuserList },
  //       })
  //         .populate("phonebook email_address")
  //         .lean();
  //     }


  //     let ii = [];
  //     let statuss = [];
  //     if(ur) {
  //       for (let i in ur) {
  //         ii.push(ur[i]._id);
  //         statuss.push(ur[i].seller_status);
  //       }

  //       let check = await CodeDomainValues.find(
  //         { status: "active", deleted: null, code: { $in: statuss } },
  //         { value: true, code: true }
  //       );

  //       for (let i in ur) {
  //         for (let k in check) {
  //           if (check[k].code == ur[i].seller_status) {
  //             ur[i].seller_status = check[k].value;
  //           }
  //         }
  //       }

  //       var assign = await USAssignment.find(
  //         { parent_entity_id: { $in: ii } },
  //         { keyidentifier_value: true, parent_entity_id: true }
  //       );
  //       let ids = [];

  //       for (let i in ur) {
  //         for (let as in assign) {
  //           if (assign[as].parent_entity_id == ur[i]._id) {
  //             ur[i].assignTo = assign[as].keyidentifier_value;
  //           }
  //         }
  //         ids.push(ur[i]._id);
  //       }

  //       var bus = await Bussiness.find(
  //         { individual: { $in: ids } },
  //         { bus_name: true }
  //       );

  //       for (let i in ur) {
  //         for (let j in bus) {
  //           if (bus[j].bus_name && bus[j].individual == ur[i]._id) {
  //             ur[i].bus_name = bus[j].bus_name;
  //           }
  //         }
  //       }
  //     }
  //     res.json({ message: "success", data: ur });
  //   });
  //   } else {

  //   globalService.getByPageWFS(req, async (keyList) => {

  //     let ii = [];
  //     let jj = [];
  //     let statuss = [];
  //     let srvassignList = await serviceAssign.find(
  //       { deleted: null , assing_user_id : req.body.userId}
  //     );

  //     for (let i in srvassignList) {
  //         ii.push(srvassignList[i].parent_entity_id);
  //     }


  //     // var domValue_new = await CodeDomainValues.findOne({ _id: req.body.packaging_type, $or: [{ deleted: null }, { deleted: "no" }] })


  //     var createdmy = await User.find({
  //         deleted: null,create_user: req.body.userId 
  //     });
      
  //     for (let j in createdmy) {
  //         ii.push(createdmy[j].individual);
  //     }

  //     var ur = await Individual.find({
  //         deleted: null,_id: { $in: ii } ,seller_status: { $in: keyList },
  //     })
  //     .populate("phonebook email_address")
  //     .lean();

        
  //     var bus = await Bussiness.find(
  //       { individual: { $in: ii } },
  //       { bus_name: true }
  //     );

  //     for (let i in ur) {
  //       for (let j in bus) {
  //         if (bus[j].bus_name && bus[j].individual == ur[i]._id) {
  //           ur[i].bus_name = bus[j].bus_name;
  //         }
  //       }
  //     }

  //     for (let i in ur) {         
  //       statuss.push(ur[i].seller_status);
  //     }


  //     let check = await CodeDomainValues.find(
  //       { status: "active", deleted: null, code: { $in: statuss } },
  //       { value: true, code: true }
  //     );

  //     for (let j in ur) {
  //       for (let k in check) {
  //         if (check[k].code == ur[j].seller_status) {
  //           ur[j].seller_status = check[k].value;
  //         }
  //       }
  //     }

  //     res.json({ message: "success", data: ur });

  //   });

  //   }
   
  // }
};


exports.saveOtp = async (data)=> {
  var currentDate = new Date();
  var expDate = new Date(currentDate.getTime() + 5*60000);

  OTP.deleteMany({
    otp_type: data.otp_type,
    otp_medium_type: data.otp_medium_type,
    email_add_id: data.email_add_id,
  }).exec(async(err, result) => {

    let otpDetails = {
      otp_type: data.otp_type,
      otp_medium_type: data.otp_medium_type,
      otp: data.otp,
      otp_expire_ts: expDate,
      phone_book_id: data.phone_book_id || '',
      email_add_id: data.email_add_id,
      status: 'active',
      create_user: null,
      individual: data.individual || null,
      deleted: null,
      editedby:null,
      deletedby:null
    };

    let otp = await OTP.create(otpDetails);
    console.log(otp);
  });
}
