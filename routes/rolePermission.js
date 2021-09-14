var express = require("express");
var router = express.Router();
const Role = require("../models/role");
const Service = require("./global_service");
const RoleService = require("../models/service_role");
const mdl_service = require('../models/mdl_service');
const userRole = require('../models/user_role');
const ServiceCodeDomainValue = require("../models/service_code_domain_value");
const Individual = require("../models/individual");
const CodeDomain = require("../models/code_domain");
const CodeDomainValues = require("../models/code_domainValues");

router.post("/getRolePermission", async function (req, res, next) {

  let data = {
    // Section For Onborading AND his related common form
    generalinformationview: false,
    additionalinformationview: false,
    addressview: false,
    kycdocumentsview: false,
    personaldetailsview: false,
    sellerstoreprofileview: false,
    marketplaceview: false,
    socialmediaconnectview: false,
    paymentbankingserviceview: false,
    attachementsview: false,
    productsview: false,
    readOnlyAll: false,
  }


  let pageName = await mdl_service.findOne({ route: req.body.formName,deleted:null,status:"active"},{name:true,route:true});

  let parServiceInfo = pageName;
  if(pageName && pageName.name){
    pageName = pageName.name
  }

  const role = await userRole.findOne({ userId: '' + req.body.userId });

  const roleName = await Role.findOne({ _id: '' + role.roleId },{name:true});


  if(roleName.name == "User") {
    // For Get User Status
      const sellerStatus = await Individual.findOne({ _id: req.body.userId },{seller_status:true});

    // End
    
    // For Get CodeDomain Code Data
      const check = await CodeDomain.findOne({
        code: "WRK_STS",
        status: "active",
      });
      const fetch = await CodeDomainValues.findOne({ deleted: null, codedomain: check,code:sellerStatus.seller_status,deleted:null,status: "active" });
    // End


    // For Get Particular Service Work Flow Status
      if(fetch) {
        const particularServiceData = await mdl_service.findOne({ route: { $in: req.body.formName }, status: 'active',deleted:null,status: "active"  }).populate('parent_id');
        if(particularServiceData) {
          var particularFormStatus = await ServiceCodeDomainValue.findOne({ serviceId: particularServiceData._id,code_domain_value:fetch.code ,deleted:null}, { code_domain_value: true, serviceId: true, code_domain: true,relationshipType:true }).populate('code_domain');
        }
      }       
      // End
  }


  // For Check Service ReadOnly OR Not
    // const particularFormStatus = await ServiceCodeDomainValue.find({ serviceId: parServiceInfo._id,deleted:null }, { code_domain_value: true, serviceId: true, code_domain: true,relationshipType:true });
  // END Code

    const obj = await RoleService.find({ roleId: role.roleId });
    const ids = [];

    for (let i in obj) {
      ids.push(obj[i].serviceId);
    }

    const services = await mdl_service.find({ _id: { $in: ids }, status: 'active' ,deleted: null}).populate('parent_id');

    // let namesArr = ['send for onboarding', 'reject as registration', 'approve as a lead', 'reject as a prospect', 'approve as registration','reject as a lead','send for activation','reject as onboarding','activate seller account','reject as activation','mark as verified','activate seller','account suspend','account inactivate'];
    let otherIds = [];

    let finalServices = {};

  for (let j in services) {
    if (services[j].parent_id && services[j].parent_id.name) {
      if (services[j].parent_id.route == req.body.formName) {
        finalServices[services[j].service_code] = true;
        otherIds.push(services[j]._id);
        // if (namesArr.indexOf(services[j].name.toLowerCase()) != -1) {
        //   otherIds.push(services[j]._id);
        // }
      }
    }
  }

  const work_flow_status = await ServiceCodeDomainValue.find({ serviceId: {$in: otherIds}, deleted: null });
  for (let i in work_flow_status) {
    for (let j in services) {
      if (work_flow_status[i].serviceId == ''+services[j]._id) {
        finalServices[services[j].service_code] = work_flow_status[i].code_domain_value;
      }
    }
  }


  if(particularFormStatus && particularFormStatus.relationshipType == "RO") {

      finalServices['general-information-view'] = true;
      finalServices['additional-information-view'] = true;
      finalServices['address-view'] = true;
      finalServices['kyc-documents-view'] = true;
      finalServices['personal-details-view'] = true;
      finalServices['seller-store-profile-view'] = true;
      finalServices['marketplace-view'] = true;
      finalServices['social-media-connect-view'] = true;
      finalServices['payment-banking-service-view'] = true;
      finalServices['attachements-view'] = true;
      finalServices['products-view'] = true;
      finalServices['additional-business-information-view'] = true;

      finalServices.readOnlyAll = true;

      finalServices.add = false;
      finalServices.edit = false;
      finalServices.delete = false;
      finalServices.import = false;
      finalServices.export = false;
      finalServices['update-and-exit'] = false;
    
  }


  console.log("finalServices>>",finalServices);

  res.json({ message: "success", data: finalServices,pageName:pageName });
});


router.post("/getUserSidebar", async function (req, res, next) {

  var role = await userRole.findOne({ userId: req.body.userId});


  if (role) {
    var obj = await RoleService.find({ roleId: role.roleId });
  }


  // Permission Menu List with Section
  const finalIds = [];
  const serviceids = [];

  for (let i in obj) {
    if (obj[i].serviceId) {
      serviceids.push(obj[i].serviceId);
    }
  }

  var serviceType = await mdl_service.find({ _id: { $in: serviceids }, status: 'active',deleted:null });
  const menuactionids = [];

  for (let i in serviceType) {
    if (serviceType[i].type == "menu") {
      finalIds.push(serviceType[i]._id);
    }

    if (serviceType[i].type == "action") {
      finalIds.push(serviceType[i].parent_id.toString());
    }

    if (serviceType[i].type == "section") {
      menuactionids.push(serviceType[i].parent_id);
    }
  }

  var menuAction = await mdl_service.find({ _id: { $in: menuactionids }, status: 'active' ,deleted:null});

  for (let i in menuAction) {
    if (menuAction[i].parent_id) {
      finalIds.push(menuAction[i].parent_id.toString());
    }
  }

  var services = await mdl_service.find({ _id: { $in: finalIds }, status: 'active', type: 'menu',deleted:null }).populate('parent_id');
  const finalMenu = [];

  for (let j in services) {
    finalMenu.push(''+services[j]._id);
  }

  let menuData = await mdl_service.find({ status: 'active', type: 'menu',deleted:null }).sort({ position: 1 }).lean();


  Service.sideMenuDataMgmt(menuData, finalMenu, (menuResponse) => {
    res.json({ message: "success", data: menuResponse });
  });
});


router.post("/getSuperAdminSidebar", async function (req, res, next) {

  let menuData = await mdl_service.find({ status: 'active', type: 'menu' ,deleted:null}).sort({ position: 1 }).lean();

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

        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  let menuResult = await list_to_tree(menuData);

  res.json({ message: "success", data: menuResult });
});


module.exports = router;