const express = require("express");
const passwordHash = require("password-hash");
const router = express.Router();
const Individual = require("../models/individual");
const Temp_Individual = require("../models/temp_individual");
const CodeDomain = require("../models/code_domain");
const CodeDomainValues = require("../models/code_domainValues");
const RelatedCodeDomain = require("../models/related_domain");
const CommunicationComposition = require("../models/comm_compositions");
const MEDIA = require("../models/media");
const Bussiness_Individual = require("../models/business_individual");
const Bussiness = require("../models/bussiness");
const User = require("../models/user");
const OTP = require("../models/otp");
const PhoneBook = require("../models/phone_book");
const EmailAddress = require("../models/email_address");
const Address = require("../models/address");
const { dynamicEmail } = require("./EmailSend");
const jwt = require("jsonwebtoken");
const env = require("../config.env");
const URL = require("../models/url");
const History = require("../models/history");
const Bank = require("../models/bankdetails");
const USAssignment = require("../models/user_service_assignment");
const MarketPlace = require("../models/marketePlace");
const roleModel = require("../models/role");
const userRole = require("../models/user_role");
const TargatIndustry = require("../models/targat_buyer_industry");
const ProCategory = require("../models/business_pro_category");
const ProCapacity = require("../models/business_pro_capacity");
const BusMarketPlacecountry = require("../models/bus_marketplace_country");
const globalService = require("./global_service");
const { eventTempSend } = require("./passwordsend");
const marketplace_country = require("../models/marketplace_countries");
const Product = require("../models/product");

// Create Sller
router.post("/create", async function (req, res, next) {
  var isExistEmail = await EmailAddress.findOne({
    email_type: "personal",
    email_add: req.body.email,
    code: "RGEM",
    deleted: null
  });
  var isExistPhone = await PhoneBook.findOne({
    phone_type: "personal",
    phone_number: req.body.mobile,
    code: "RGPH",
    deleted: null
  });

  let both = false;
  if (isExistPhone && isExistEmail) {
      both = true;
  }

  rand = Math.floor(Math.random() * 2000 + 999);
  if (isExistPhone) {
    var otpPanding = await Individual.findOne({
      phonebook: isExistPhone._id,
      seller_status: "NVA",
      $or: [{ deleted: null }, { deleted: "no" }]
    }).populate("phonebook email_address");

    if (otpPanding && otpPanding.email_address) {
      if (otpPanding.email_address.email_add != req.body.email) {
        otpPanding = null;
      }
    }

    if (otpPanding) {
      let body = {
        userId: otpPanding._id,
        otp: rand,
      };
      globalService.emailTemplateSend(
        "Seller Register OTP",
        body,
        (eventTemplate) => {}
      );

      globalService.saveOtp({
        otp_type: 'registration',
        otp_medium_type: 'email',
        otp: rand,
        email_add_id: req.body.email,
        individual: otpPanding._id
      });
    }
    res.json({ message: "Mobile number already exists.", data: otpPanding, both: both });
  } else if (isExistEmail) {
    var otpPanding = await Individual.findOne({
      email_address: isExistEmail._id,
      seller_status: "NVA",
      $or: [{ deleted: null }, { deleted: "no" }]
    }).populate("phonebook email_address");

     if (otpPanding && otpPanding.email_address) {
      if (otpPanding.email_address.email_add != req.body.email) {
        otpPanding = null;
      }
    }
    res.json({ message: "Email ID already exists.", data: otpPanding, both: both });
  } else {
    req.body.password = passwordHash.generate(req.body.password);
    var Indivi = await Individual.create(req.body);

    var Obj = {
      individual: Indivi._id,
      username: req.body.email,
      password: req.body.password,
    };
    var ObjUser = await User.create(Obj);

    var phone = {
      phone_type: "personal",
      entity_type: "mobile", //(main,alternate)
      countery_code: "",
      phone_number: req.body.mobile,
      status: "active",
      create_user: Indivi._id,
      individual: Indivi._id,
      code: "RGPH",
      deleted: null,
    };
    var SavedEmail = {
      email_type: "personal", // (personel,corporate)
      email_add: req.body.email,
      status: "active",
      create_user: Indivi._id,
      individual: Indivi._id,
      code: "RGEM",
      deleted: null,
    };

    var business_email = {
        email_type: 'business', // (personel,corporate)
        email_add: req.body.email,
        status: 'active',
        editedby: '',
        deleted: null,
        deletedby: null,
        bussiness: null,
        create_user: Indivi._id,
        individual: Indivi._id,
        code: 'BSEM'
    }
    EmailAddress.create(business_email,()=>{});
    
    var business_phone = {
        phone_type: 'mobile',
        entity_type: 'business',
        countery_code: '',
        isd_code: '',
        area_code: '',
        phone_number: req.body.mobile,
        status: 'active',
        deleted: null,
        deletedby: null,
        bussiness: null,
        create_user: Indivi._id,
        individual: Indivi._id,
        code: 'BSPH'
    }
    PhoneBook.create(business_phone, () => {});


    var emAddr = await EmailAddress.create(SavedEmail);
    var phBook = await PhoneBook.create(phone);

    globalService.saveOtp({
      otp_type: 'registration',
      otp_medium_type: 'email',
      otp: rand,
      email_add_id: req.body.email,
      individual: Indivi._id
    });

    let body = {
      userId: Indivi._id,
      otp: rand,
    };

    await Individual.updateOne(
      { _id: Indivi._id },
      {
        $set: {
          phonebook: phBook._id,
          email_address: emAddr._id,
          seller_status: req.body.seller_status,
        },
      }
    );

    var fetchIndividual = await Individual.findOne({
      _id: Indivi._id,
    }).populate("phonebook email_address");

    var logeduser = await User.findOne({ _id: ObjUser._id });
    var sellerRole = await roleModel.findOne({ name: "User" });

    userRole.create(
      {
        userId: Indivi._id,
        roleId: sellerRole._id,
        startDate: null,
        endDate: null,
      },
      () => {}
    );

    globalService.emailTemplateSend(
      "Seller Register OTP",
      body,
      (eventTemplate) => {}
    );

    res.json({
      message: "success",
      data: fetchIndividual,
      // code: rand,
      logeduser: logeduser,
    });
  }
});

// CreateTemp Sller
router.post("/temp/create", async function (req, res, next) {
  var email_isExist = false;
  var phone_isExist = false;

  for (let k = 0; k < req.body.length; k++) {
    var isExistEmail = await EmailAddress.findOne({
      deleted: null,
      email_type: "personal",
      email_add: req.body[k].email,
      code: "RGEM",
    });
    var isExistPhone = await PhoneBook.findOne({
      deleted: null,
      phone_type: "personal",
      phone_number: req.body[k].mobile,
      code: "RGPH",
    });

    if (isExistEmail) {
      email_isExist = true;
    } else if (isExistPhone) {
      phone_isExist = true;
    }
  }

  if (email_isExist && phone_isExist) {
    res.json({ message: "Email and phone already exist" });
  } else if (email_isExist && !phone_isExist) {
    res.json({ message: "Email already exist" });
  } else if (!email_isExist && phone_isExist) {
    res.json({ message: "Phone already exist" });
  }

  if (!email_isExist && !phone_isExist) {
    for (let j = 0; j < req.body.length; j++) {
      rand = Math.floor(Math.random() * 2000 + 999);
      var pass = passwordHash.generate(req.body[j].password.toString());
      var Indivi = await Temp_Individual.create(req.body[j]);
      var Obj = {
        individual: Indivi._id,
        username: req.body[j].email,
        password: pass,
      };
      var ObjUser = await User.create(Obj);
      var phone = {
        phone_type: "personal",
        entity_type: "mobile", //(main,alternate)
        countery_code: "",
        phone_number: req.body[j].mobile,
        status: "active",
        create_user: Indivi._id,
        individual: Indivi._id,
        code: "RGPH",
        deleted: null,
      };
      var SavedEmail = {
        email_type: "personal", // (personel,corporate)
        email_add: req.body[j].email,
        status: "active",
        create_user: Indivi._id,
        individual: Indivi._id,
        code: "RGEM",
        deleted: null,
      };
      var emAddr = await EmailAddress.create(SavedEmail);
      var phBook = await PhoneBook.create(phone);
      await Temp_Individual.updateOne(
        { _id: Indivi._id },
        { $set: { phonebook: phBook._id, email_address: emAddr._id } }
      );
    }
    res.json({ message: "success" });
  }
});

// Create Admin
router.get("/createAdmin", async function (req, res, next) {
  var body = {
    firstname: "Aditya",
    middlename: "",
    lastname: "Kukar",
    email: "Aditya@dekho.co",
    role: "admin",
    password: "12345678",
  };
  var isExist = await Individual.findOne({ email: body.email, role: "admin" });
  if (isExist) {
    res.json({ message: "already" });
  } else {
    rand = Math.floor(Math.random() * 2000 + 999);
    body.password = passwordHash.generate(body.password);
    var Indivi = await Individual.create(body);
    var Obj = {
      individual: Indivi._id,
      username: body.email,
      password: body.password,
    };
    User.create(Obj, () => {});
    res.json({ message: "success" });
  }
});

// get All market-place
router.get("/market-place-country", async function (req, res) {
  var check = await CodeDomain.findOne({ code: "CNTRY" });
  var fetch = await CodeDomainValues.find({ deleted: null,status:"active", codedomain: check }).sort({position:1,value:1});
  var obj = await marketplace_country.find();
  res.json({ message: "success", data: obj, fetch: fetch });
});

// get Seller By id
router.get("/:id", async function (req, res, next) {
  var indiv = await Individual.findOne({ _id: req.params.id });
  var bus = await Bussiness.findOne({ individual: req.params.id });

  // get Register Email
  var rgem = await EmailAddress.findOne({
    individual: req.params.id,
    status: "active",
    code: "RGEM",
  });
  var bsem = await EmailAddress.findOne({
    individual: req.params.id,
    status: "active",
    code: "BSEM",
  });
  var bsiem = await EmailAddress.findOne({
    individual: req.params.id,
    status: "active",
    code: "BSIEM",
  });
  var bsiem2 = await EmailAddress.findOne({
    individual: req.params.id,
    status: "active",
    code: "BSIEM2",
  });

  // get Phonebook phones
  var rgph = await PhoneBook.findOne({
    individual: req.params.id,
    status: "active",
    code: "RGPH",
  });
  var bsph = await PhoneBook.findOne({
    individual: req.params.id,
    status: "active",
    code: "BSPH",
  });
  var bsiph = await PhoneBook.findOne({
    individual: req.params.id,
    status: "active",
    code: "BSIPH",
  });
  var bsiph2 = await PhoneBook.findOne({
    individual: req.params.id,
    status: "active",
    code: "BSIPH2",
  });
  var bstpn = await PhoneBook.findOne({
    individual: req.params.id,
    status: "active",
    code: "BLTEP",
  });

  // Documents
  let attachementArray = [];

  let docType = [
    "IEC",
    "IPC",
    "APV",
    "UAN",
    "Pan Numer",
    "GST Numer",
    "TYP1",
    "PRF",
    "LOGO",
    "BIO",
    "SELFATTESTED_DOCUMENTS",
    "AWARDS",
    "ManuNarr",
    "SLFINTRO_PROD",
    "PRDPHOTO_CRAFT",
    "PRDVIDEO_CRAFT",
  ];

  var docList = await MEDIA.find({
    individual: req.params.id,
    status: "active",
    url: { $ne: "" },
    Doc_type: { $in: docType },
  });

  for (let i in docList) {
    attachementArray.push(docList[i]);
  }

  var iec = null;
  var ipc = null;
  var apv = null;
  var uan = null;
  var panNum = null;
  var gstNum = null;
  var types = [];
  var prf = null;
  var logo = null;
  var bio = null;
  var documents = [];
  var awards = [];
  var ManufacNarrative = null;
  var self_intro = null;
  var prdPhotos = [];
  var prdVideos = [];

  for (let i in attachementArray) {
    if (attachementArray[i].Doc_type == "IEC") {
      iec = attachementArray[i];
    }
    if (attachementArray[i].Doc_type == "IPC") {
      ipc = attachementArray[i];
    }
    if (attachementArray[i].Doc_type == "APV") {
      apv = attachementArray[i];
    }
    if (attachementArray[i].Doc_type == "UAN") {
      uan = attachementArray[i];
    }
    if (attachementArray[i].Doc_type == "Pan Numer") {
      panNum = attachementArray[i];
    }
    if (attachementArray[i].Doc_type == "GST Numer") {
      gstNum = attachementArray[i];
    }
    if (attachementArray[i].Doc_type == "PRF") {
      prf = attachementArray[i];
    }
    if (attachementArray[i].Doc_type == "LOGO") {
      logo = attachementArray[i];
    }
    if (attachementArray[i].Doc_type == "BIO") {
      bio = attachementArray[i];
    }
    if (attachementArray[i].Doc_type == "ManuNarr") {
      ManufacNarrative = attachementArray[i];
    }
    if (attachementArray[i].Doc_type == "SLFINTRO_PROD") {
      self_intro = attachementArray[i];
    }

    if (attachementArray[i].Doc_type == "TYP1") {
      types.push(attachementArray[i]);
    }
    if (attachementArray[i].Doc_type == "SELFATTESTED_DOCUMENTS") {
      documents.push(attachementArray[i]);
    }
    if (attachementArray[i].Doc_type == "AWARDS") {
      awards.push(attachementArray[i]);
    }
    if (attachementArray[i].Doc_type == "PRDPHOTO_CRAFT") {
      prdPhotos.push(attachementArray[i]);
    }
    if (attachementArray[i].Doc_type == "PRDVIDEO_CRAFT") {
      prdVideos.push(attachementArray[i]);
    }
  }

  /*BANK Details*/
  var bankdet = await Bank.findOne({
    individual: req.params.id,
    status: "active",
    deleted: null
  });

  // get Media against code and individual ID
  var first = await Address.findOne({
    individual: req.params.id,
    status: "active",
    code: "CRSAD",
  });
  var second = await Address.findOne({
    individual: req.params.id,
    status: "active",
    code: "SSAD",
  });
  var third = await Address.findOne({
    individual: req.params.id,
    status: "active",
    code: "RGAD",
  });

  var busIndividual = await Bussiness_Individual.findOne({
    individual: req.params.id,
  });
  var website = await URL.findOne({
    individual: req.params.id,
    status: "active",
    url_type: "companywebsite",
  });

  // MarketPlace
  var BMC = null;
  var product_cap = null;
  var product_cat = null;
  var target_ind_ = null;

  if (bus && bus._id) {
    BMC = await BusMarketPlacecountry.find({ bussiness: bus._id });
    product_cap = await ProCapacity.find({ bussiness: bus._id });
    product_cat = await ProCategory.find({ bussiness: bus._id });
    target_ind_ = await TargatIndustry.find({ bussiness: bus._id });
  }

  // Get category list
  globalService.getCat(product_cat, (result) => {
    const store = {
      emails: { rgem: rgem, bsem: bsem, bsiem: bsiem, bsiem2: bsiem2 },
      phonebook: {
        rgph: rgph,
        bsph: bsph,
        bsiph: bsiph,
        bsiph2: bsiph2,
        bstpn: bstpn,
      },
      kyc_doc: { iec: iec, ipc: ipc, apv: apv, uan: uan },
      address: { crsad: first, start: second, rgad: third },
      seller: {
        profile: prf,
        logo: logo,
        Biography: bio,
        documents: documents,
        awards: awards,
      },
      prodCraft: {
        ManufacNarrative: ManufacNarrative,
        self_intro: self_intro,
        prdPhotos: prdPhotos,
        prdVideos: prdVideos,
      },
      trade_member: types,
      individual: indiv,
      bus_individual: busIndividual,
      bussiness: bus,
      website: website,
      panNum: panNum,
      gstNum: gstNum,
      bank: bankdet,
      Attachements: attachementArray,
      MarkPlace: {
        country: BMC,
        product_cap: product_cap,
        product_cat: result.finalList,
        target_ind: target_ind_,
      },
    };

    res.json({ message: "success", data: store, categories: result.category });
  });
});

// Update
router.post("/updateIndividual", async function (req, res, next) {
  const isExistEmail = await EmailAddress.findOne({
    email_add: req.body.emails.rgem.email_add,
    email_type: "personal",
    individual: { $ne: req.body.individual.id },
    deleted: null,
  });
  const isExistPhone = await PhoneBook.findOne({
    phone_number: req.body.phonebook.rgph.phone_number,
    phone_type: "personal",
    individual: { $ne: req.body.individual.id },
    deleted: null,
  });

  if (isExistEmail) {
    res.json({ message: "Email ID already exists." });
  } else if (isExistPhone) {
    res.json({ message: "Mobile number already exists." });
  } else {
    var historyObj = {
      parent_entity_name: "",
      context_entity_name: "",
      field_name: "",
      old_value: "",
      new_value: "",
      history_type: "edit",
      user_session_id: "",
      status: "active",
      deleted: null,
      editedby: req.body.individual.id,
      individual: req.body.individual.id,
      business: req.body.bussiness.id,
      product: null,
      service: null,
    };

    var indiv = await Individual.findOne({ _id: req.body.individual.id });
    var bus = await Bussiness.findOne({ _id: req.body.bussiness.id });
    var busInd = await Bussiness_Individual.findOne({
      _id: req.body.bus_individual.id,
    });
    var website = {};

    if (req.body.website.id) {
      website = await URL.findOne({
        _id: req.body.website.id,
        status: "active",
        url_type: "companywebsite",
      });
    }

    var Rg_Email = {};
    var Bs_Email = {};
    var Bsi_Email = {};
    var Bsi2_Email = {};

    if (req.body.emails.rgem.id) {
      var Rg_Email = await EmailAddress.findOne({
        _id: req.body.emails.rgem.id,
        code: "RGEM",
      });
    }
    if (req.body.emails.bsem.id) {
      var Bs_Email = await EmailAddress.findOne({
        _id: req.body.emails.bsem.id,
        code: "BSEM",
      });
    }
    if (req.body.emails.bsiem.id) {
      var Bsi_Email = await EmailAddress.findOne({
        _id: req.body.emails.bsiem.id,
        code: "BSIEM",
      });
    }
    if (req.body.emails.bsiem2.id) {
      var Bsi2_Email = await EmailAddress.findOne({
        _id: req.body.emails.bsiem2.id,
        code: "BSIEM2",
      });
    }

    /* Get Emails against Type and ID*/
    //RGph  => means that => Register Phone
    var Rg_Phone = await PhoneBook.findOne({
      _id: req.body.phonebook.rgph.id,
      code: "RGPH",
    });
    var Bs_Phone = await PhoneBook.findOne({
      _id: req.body.phonebook.bsph.id,
      code: "BSPH",
    });
    var Bsi_Phone = await PhoneBook.findOne({
      _id: req.body.phonebook.bsiph.id,
      code: "BSIPH",
    });
    var Bsi2_Phone = await PhoneBook.findOne({
      _id: req.body.phonebook.bsiph2.id,
      code: "BSIPH2",
    });
    var Bst_Phone = await PhoneBook.findOne({
      _id: req.body.phonebook.bstpn.id,
      code: "BLTEP",
    });

    /* Get Addresses*/
    var crsAd = await Address.findOne({
      individual: req.body.individual.id,
      status: "active",
      code: "CRSAD",
    });
    var ssAd = await Address.findOne({
      individual: req.body.individual.id,
      status: "active",
      code: "SSAD",
    });
    var rgAd = await Address.findOne({
      individual: req.body.individual.id,
      status: "active",
      code: "RGAD",
    });

    /* Get Media's*/
    /*KYC Documents*/
    var apv = await MEDIA.findOne({
      individual: req.body.individual.id,
      status: "active",
      Doc_type: "APV",
    });
    var ipc = await MEDIA.findOne({
      individual: req.body.individual.id,
      status: "active",
      Doc_type: "IPC",
    });
    var uan = await MEDIA.findOne({
      individual: req.body.individual.id,
      status: "active",
      Doc_type: "UAN",
    });
    var iec = await MEDIA.findOne({
      individual: req.body.individual.id,
      status: "active",
      Doc_type: "IEC",
    });

    var panNum = await MEDIA.findOne({
      individual: req.body.individual.id,
      status: "active",
      Doc_type: "Pan Numer",
    });
    var gstNum = await MEDIA.findOne({
      individual: req.body.individual.id,
      status: "active",
      Doc_type: "GST Numer",
    });

    /*TradeMember Ship*/
    var TradeMember = await MEDIA.find({
      individual: req.body.individual.id,
      status: "active",
      Doc_type: "TYP1",
    });

    /*Seller Profile Bio Logo documents Awards*/
    var prf = await MEDIA.findOne({
      individual: req.body.individual.id,
      status: "active",
      Doc_type: "PRF",
    });
    var logo = await MEDIA.findOne({
      individual: req.body.individual.id,
      status: "active",
      Doc_type: "LOGO",
    });
    var bio = await MEDIA.findOne({
      individual: req.body.individual.id,
      status: "active",
      Doc_type: "BIO",
    });
    var documents = await MEDIA.find({
      individual: req.body.individual.id,
      status: "active",
      Doc_type: "SELFATTESTED_DOCUMENTS",
    });
    var awards = await MEDIA.find({
      individual: req.body.individual.id,
      status: "active",
      Doc_type: "AWARDS",
    });

    /*Prodcraft Manufac_Narrative selfIntroVideo*/
    var ManufacNarrative = await MEDIA.findOne({
      individual: req.body.individual.id,
      status: "active",
      Doc_type: "ManuNarr",
    });
    var self_intro = await MEDIA.findOne({
      individual: req.body.individual.id,
      status: "active",
      Doc_type: "SLFINTRO_PROD",
    });
    var prdPhotos = await MEDIA.find({
      individual: req.body.individual.id,
      status: "active",
      Doc_type: "PRDPHOTO_CRAFT",
    });
    var prdVideos = await MEDIA.find({
      individual: req.body.individual.id,
      status: "active",
      Doc_type: "PRDVIDEO_CRAFT",
    });

    var bankdet = await Bank.findOne({
      individual: req.body.individual.id,
      status: "active",
      deleted: null,
    });

    if (panNum != null) {
      if (panNum.url != req.body.pan.url) {
        historyObj.field_name = "Url";
        historyObj.old_value = panNum.url;
        historyObj.new_value = req.body.pan.url;
        History.create(historyObj, () => {});
      }
    }

    if (panNum != null) {
      if (panNum.description != req.body.pan.description) {
        historyObj.field_name = "Description";
        historyObj.old_value = panNum.description;
        historyObj.new_value = req.body.pan.description;
        History.create(historyObj, () => {});
      }
    }

    if (gstNum != null) {
      if (gstNum.url != req.body.gst.url) {
        historyObj.field_name = "Url";
        historyObj.old_value = gstNum.url;
        historyObj.new_value = req.body.gst.url;
        History.create(historyObj, () => {});
      }
    }

    if (gstNum != null) {
      if (gstNum.description != req.body.gst.description) {
        historyObj.field_name = "Description";
        historyObj.old_value = gstNum.description;
        historyObj.new_value = req.body.gst.description;
        History.create(historyObj, () => {});
      }
    }

    if (indiv && indiv.seller_status && indiv.seller_status == "PR") {
      Individual.updateOne(
        { _id: req.body.individual.id },
        {
          $set: {
            seller_status: "NWPROS",
          },
        }
      ).exec((err, result) => {});
    }

    /*create Individual history*/
    // FirstName
    if (indiv.firstname != req.body.individual.firstname) {
      historyObj.field_name = "firstname";
      historyObj.old_value = indiv.firstname;
      historyObj.new_value = req.body.individual.firstname;
      History.create(historyObj, () => {});
    }

    // Product_Craft_name
    if (indiv.Product_Craft_name != req.body.individual.Product_Craft_name) {
      historyObj.field_name = "Product Craft name";
      historyObj.old_value = indiv.Product_Craft_name;
      historyObj.new_value = req.body.individual.Product_Craft_name;
      History.create(historyObj, () => {});
    }

    // Product_Craft_desc
    if (indiv.Product_Craft_desc != req.body.individual.Product_Craft_desc) {
      historyObj.field_name = "Product Craft desc";
      historyObj.old_value = indiv.Product_Craft_desc;
      historyObj.new_value = req.body.individual.Product_Craft_desc;
      History.create(historyObj, () => {});
    }

    // MiddleName
    if (indiv.middlename != req.body.individual.middlename) {
      historyObj.field_name = "middlename";
      historyObj.old_value = indiv.middlename;
      historyObj.new_value = req.body.individual.middlename;
      History.create(historyObj, () => {});
    }
    // LastName
    if (indiv.lastname != req.body.individual.lastname) {
      historyObj.field_name = "lastname";
      historyObj.old_value = indiv.lastname;
      historyObj.new_value = req.body.individual.lastname;
      History.create(historyObj, () => {});
    }

    // skype
    if (indiv.skype != req.body.individual.skype) {
      historyObj.field_name = "skype";
      historyObj.old_value = indiv.skype;
      historyObj.new_value = req.body.individual.skype;
      History.create(historyObj, () => {});
    }

    // twitter
    if (indiv.twitter != req.body.individual.twitter) {
      historyObj.field_name = "twitter";
      historyObj.old_value = indiv.twitter;
      historyObj.new_value = req.body.individual.twitter;
      History.create(historyObj, () => {});
    }

    // facebook
    if (indiv.facebook != req.body.individual.facebook) {
      historyObj.field_name = "facebook";
      historyObj.old_value = indiv.facebook;
      historyObj.new_value = req.body.individual.facebook;
      History.create(historyObj, () => {});
    }

    // linkden
    if (indiv.linkden != req.body.individual.linkden) {
      historyObj.field_name = "linkden";
      historyObj.old_value = indiv.linkden;
      historyObj.new_value = req.body.individual.linkden;
      History.create(historyObj, () => {});
    }

    // sellOnwebsite
    if (indiv.sellOnwebsite != req.body.individual.sellOnwebsite) {
      historyObj.field_name = "sellOnwebsite";
      historyObj.old_value = indiv.sellOnwebsite;
      historyObj.new_value = req.body.individual.sellOnwebsite;
      History.create(historyObj, () => {});
    }

    /*Create Business history*/
    // Business Storename
    if (bus.storename != req.body.bussiness.storename) {
      historyObj.field_name = "storename";
      historyObj.old_value = bus.storename;
      historyObj.new_value = req.body.bussiness.storename;
      History.create(historyObj, () => {});
    }
    // fax
    if (bus.fax != req.body.bussiness.fax) {
      historyObj.field_name = "fax";
      historyObj.old_value = bus.fax;
      historyObj.new_value = req.body.bussiness.fax;
      History.create(historyObj, () => {});
    }
    // Business OwnerShip
    if (bus.bus_ownership != req.body.bussiness.bus_ownership) {
      historyObj.field_name = "bus_ownership";
      historyObj.old_value = bus.bus_ownership;
      historyObj.new_value = req.body.bussiness.bus_ownership;
      History.create(historyObj, () => {});
    }
    // Business Entity Type
    if (bus && bus.bus_entity_type && bus.bus_entity_type != req.body.bussiness.bus_entity_type) {
      var oldval = await CodeDomainValues.findOne({ deleted: null, _id: bus.bus_entity_type });
      var newval = await CodeDomainValues.findOne({ deleted: null, _id: req.body.bussiness.bus_entity_type });
      historyObj.field_name = "bus_entity_type";
      historyObj.old_value = oldval.value;
      historyObj.new_value = newval.value;
      History.create(historyObj, () => {});
    }
    // Business Name
    if (bus.bus_name != req.body.bussiness.bus_name) {
      historyObj.field_name = "bus_name";
      historyObj.old_value = bus.bus_name;
      historyObj.new_value = req.body.bussiness.bus_name;
      History.create(historyObj, () => {});
    }

    if (bus.customOrder != req.body.bussiness.customOrder) {
      historyObj.field_name = "customOrder";
      historyObj.old_value = bus.customOrder;
      historyObj.new_value = req.body.bussiness.customOrder;
      History.create(historyObj, () => {});
    }

    if (bus.hsnCode != req.body.bussiness.hsnCode) {
      historyObj.field_name = "hsnCode";
      historyObj.old_value = bus.hsnCode;
      historyObj.new_value = req.body.bussiness.hsnCode;
      History.create(historyObj, () => {});
    }
    if (bus.sellOnEb != req.body.bussiness.sellOnEb) {
      historyObj.field_name = "sellOnEb";
      historyObj.old_value = bus.sellOnEb;
      historyObj.new_value = req.body.bussiness.sellOnEb;
      History.create(historyObj, () => {});
    }

    if (bus.trademark != req.body.bussiness.trademark) {
      historyObj.field_name = "trademark";
      historyObj.old_value = bus.trademark;
      historyObj.new_value = req.body.bussiness.trademark;
      History.create(historyObj, () => {});
    }

    if (bus.vendor_profile != req.body.bussiness.vendor_profile) {
      historyObj.field_name = "Vendor Profile";
      historyObj.old_value = bus.vendor_profile;
      historyObj.new_value = req.body.bussiness.vendor_profile;
      History.create(historyObj, () => {});
    }

    if (bus.export_compliance != req.body.bussiness.export_compliance) {
      historyObj.field_name = "Export Compliance";
      historyObj.old_value = bus.export_compliance;
      historyObj.new_value = req.body.bussiness.export_compliance;
      History.create(historyObj, () => {});
    }

    if (bus.craft_name != req.body.bussiness.craft_name) {
      historyObj.field_name = "Product/Craft - Name";
      historyObj.old_value = bus.craft_name;
      historyObj.new_value = req.body.bussiness.craft_name;
      History.create(historyObj, () => {});
    }

    if (bus.craft_desc != req.body.bussiness.craft_desc) {
      historyObj.field_name = "Product/Craft - Description";
      historyObj.old_value = bus.craft_desc;
      historyObj.new_value = req.body.bussiness.craft_desc;
      History.create(historyObj, () => {});
    }

    /*BANK DETAILS*/
    if (bankdet != null) {
      if (bankdet.accountholdername != req.body.bank.accountholdername) {
        historyObj.field_name = "accountholdername";
        historyObj.old_value = bankdet.accountholdername;
        historyObj.new_value = req.body.bank.accountholdername;
        History.create(historyObj, () => {});
      }

      if (bankdet.bankname != req.body.bank.bankname) {
        historyObj.field_name = "bankname";
        historyObj.old_value = bankdet.bankname;
        historyObj.new_value = req.body.bank.bankname;
        History.create(historyObj, () => {});
      }

      if (bankdet.branchname != req.body.bank.branchname) {
        historyObj.field_name = "branchname";
        historyObj.old_value = bankdet.branchname;
        historyObj.new_value = req.body.bank.branchname;
        History.create(historyObj, () => {});
      }

      if (bankdet.accountnumber != req.body.bank.accountnumber) {
        historyObj.field_name = "accountnumber";
        historyObj.old_value = bankdet.accountnumber;
        historyObj.new_value = req.body.bank.accountnumber;
        History.create(historyObj, () => {});
      }
      if (bankdet.ifsccode != req.body.bank.ifsccode) {
        historyObj.field_name = "ifsccode";
        historyObj.old_value = bankdet.ifsccode;
        historyObj.new_value = req.body.bank.ifsccode;
        History.create(historyObj, () => {});
      }

      if (bankdet.completename != req.body.bank.completename) {
        historyObj.field_name = "completename";
        historyObj.old_value = bankdet.completename;
        historyObj.new_value = req.body.bank.completename;
        History.create(historyObj, () => {});
      }
    }

    /*Create BusinessIndividual history*/
    // Username
    if (busInd.username != req.body.bus_individual.username) {
      historyObj.field_name = "Founder/Promoter Name";
      historyObj.old_value = busInd.username;
      historyObj.new_value = req.body.bus_individual.username;
      History.create(historyObj, () => {});
    }
    // job title
    if (busInd.job_title != req.body.bus_individual.job_title) {
      historyObj.field_name = "job_title";
      historyObj.old_value = busInd.job_title;
      historyObj.new_value = req.body.bus_individual.job_title;
      History.create(historyObj, () => {});
    }
    // job function
    if (busInd.job_function != req.body.bus_individual.job_function) {
      historyObj.field_name = "job_function";
      historyObj.old_value = busInd.job_function;
      historyObj.new_value = req.body.bus_individual.job_function;
      History.create(historyObj, () => {});
    } // Department
    if (busInd.department != req.body.bus_individual.department) {
      historyObj.field_name = "department";
      historyObj.old_value = busInd.department;
      historyObj.new_value = req.body.bus_individual.department;
      History.create(historyObj, () => {});
    }

    /*create WebsiteUrl history*/
    // url
    if (website.url != req.body.website.url) {
      historyObj.field_name = "url";
      historyObj.old_value = website.url;
      historyObj.new_value = req.body.website.url;
      History.create(historyObj, () => {});
    }

    /*create Emails history*/
    // Register Email
    if (Rg_Email.email_add != req.body.emails.rgem.email_add) {
      historyObj.field_name = "email_add";
      historyObj.old_value = Rg_Email.email_add;
      historyObj.new_value = req.body.emails.rgem.email_add;
      History.create(historyObj, () => {});
    }

    // Business Email
    if (Bs_Email.email_add != req.body.emails.bsem.email_add) {
      historyObj.field_name = "email_add";
      historyObj.old_value = Bs_Email.email_add;
      historyObj.new_value = req.body.emails.bsem.email_add;
      History.create(historyObj, () => {});
    }

    // Business Individual Email
    if (Bsi_Email.email_add != req.body.emails.bsiem.email_add) {
      historyObj.field_name = "email_add";
      historyObj.old_value = Bsi_Email.email_add;
      historyObj.new_value = req.body.emails.bsiem.email_add;
      History.create(historyObj, () => {});
    }

    // Business Individual2 Email
    if (Bsi2_Email.email_add != req.body.emails.bsiem2.email_add) {
      historyObj.field_name = "email_add";
      historyObj.old_value = Bsi2_Email.email_add;
      historyObj.new_value = req.body.emails.bsiem2.email_add;
      History.create(historyObj, () => {});
    }

    /*create PhoneBook history*/
    // Register phone
    if (Rg_Phone.phone_number != req.body.phonebook.rgph.phone_number) {
      historyObj.field_name = "phone_number";
      historyObj.old_value = Rg_Phone.phone_number;
      historyObj.new_value = req.body.phonebook.rgph.phone_number;
      History.create(historyObj, () => {});
    }

    // Business phone
    if (Bs_Phone.phone_number != req.body.phonebook.bsph.phone_number) {
      historyObj.field_name = "phone_number";
      historyObj.old_value = Bs_Phone.phone_number;
      historyObj.new_value = req.body.phonebook.bsph.phone_number;
      History.create(historyObj, () => {});
    }

    // Business Individual phone
    if (Bsi_Phone.phone_number != req.body.phonebook.bsiph.phone_number) {
      historyObj.field_name = "phone_number";
      historyObj.old_value = Bsi_Phone.phone_number;
      historyObj.new_value = req.body.phonebook.bsiph.phone_number;
      History.create(historyObj, () => {});
    }

    // Business Individual2 phone
    if (Bsi2_Phone.phone_number != req.body.phonebook.bsiph2.phone_number) {
      historyObj.field_name = "phone_number";
      historyObj.old_value = Bsi2_Phone.phone_number;
      historyObj.new_value = req.body.phonebook.bsiph2.phone_number;
      History.create(historyObj, () => {});
    }

    // Business Individual2 telephone

    if (Bst_Phone.phone_number != req.body.phonebook.bstpn.phone_number) {
      historyObj.field_name = "phone_number";
      historyObj.old_value = Bst_Phone.phone_number;
      historyObj.new_value = req.body.phonebook.bstpn.phone_number;
      History.create(historyObj, () => {});
    }

    /*CRSAD*/
    if (crsAd && crsAd.add_line1 != req.body.address.crsad.add_line1) {
      historyObj.field_name = "add_line1";
      historyObj.old_value = crsAd.add_line1;
      historyObj.new_value = req.body.address.crsad.add_line1;
      History.create(historyObj, () => {});
    }

    if (crsAd && crsAd.add_line2 != req.body.address.crsad.add_line2) {
      historyObj.field_name = "add_line2";
      historyObj.old_value = crsAd.add_line2;
      historyObj.new_value = req.body.address.crsad.add_line2;
      History.create(historyObj, () => {});
    }

    if (crsAd && crsAd.country && crsAd.country != req.body.address.crsad.country) {
      var newVal = await CodeDomainValues.findOne({
        _id: req.body.address.crsad.country,
      });
      var oldVal = await CodeDomainValues.findOne({ _id: crsAd.country });
      historyObj.field_name = "country";
      historyObj.old_value = oldVal.value;
      historyObj.new_value = newVal.value;
      History.create(historyObj, () => {});
    }

    if (crsAd && crsAd.state && crsAd.state != req.body.address.crsad.state) {
      var newVal = await CodeDomainValues.findOne({
        _id: req.body.address.crsad.state,
      });
      var oldVal = await CodeDomainValues.findOne({ _id: crsAd.state });
      historyObj.field_name = "state";
      historyObj.old_value = oldVal.value;
      historyObj.new_value = newVal.value;
      History.create(historyObj, () => {});
    }

    if (crsAd && crsAd.city != req.body.address.crsad.city) {
      historyObj.field_name = "city";
      historyObj.old_value = crsAd.city;
      historyObj.new_value = req.body.address.crsad.city;
      History.create(historyObj, () => {});
    }

    if (crsAd && crsAd.zipcode != req.body.address.crsad.zipcode) {
      historyObj.field_name = "zipcode";
      historyObj.old_value = crsAd.zipcode;
      historyObj.new_value = req.body.address.crsad.zipcode;
      History.create(historyObj, () => {});
    }

    /*RGAD*/
    if (rgAd && rgAd.add_line1 != req.body.address.rgad.add_line1) {
      historyObj.field_name = "add_line1";
      historyObj.old_value = rgAd.add_line1;
      historyObj.new_value = req.body.address.rgad.add_line1;
      History.create(historyObj, () => {});
    }

    if (rgAd && rgAd.add_line2 != req.body.address.rgad.add_line2) {
      historyObj.field_name = "add_line2";
      historyObj.old_value = rgAd.add_line2;
      historyObj.new_value = req.body.address.rgad.add_line2;
      History.create(historyObj, () => {});
    }

    if (rgAd && rgAd.country != req.body.address.rgad.country) {
      var newVal = await CodeDomainValues.findOne({
        _id: req.body.address.rgAd.country,
      });
      var oldVal = await CodeDomainValues.findOne({ _id: rgAd.country });
      historyObj.field_name = "country";
      historyObj.old_value = oldVal.value;
      historyObj.new_value = newVal.value;
      History.create(historyObj, () => {});
    }

    if (rgAd && rgAd.state && rgAd.state != req.body.address.rgad.state) {
      var newVal = await CodeDomainValues.findOne({
        _id: req.body.address.rgad.state
      });
      var oldVal = await CodeDomainValues.findOne({ _id: rgAd.state });
      historyObj.field_name = "state";
      historyObj.old_value = oldVal.value;
      historyObj.new_value = newVal.value;
      History.create(historyObj, () => {});
    }

    if (rgAd && rgAd.city != req.body.address.rgad.city) {
      historyObj.field_name = "city";
      historyObj.old_value = rgAd.city;
      historyObj.new_value = req.body.address.rgad.city;
      History.create(historyObj, () => {});
    }

    if (rgAd && rgAd.zipcode != req.body.address.rgad.zipcode) {
      historyObj.field_name = "zipcode";
      historyObj.old_value = rgAd.zipcode;
      historyObj.new_value = req.body.address.rgad.zipcode;
      History.create(historyObj, () => {});
    }

    /*START*/

    if (ssAd && ssAd.country && ssAd.country != req.body.address.start.country) {
      var newVal = await CodeDomainValues.findOne({
        _id: req.body.address.ssAd.country,
      });
      var oldVal = await CodeDomainValues.findOne({ _id: ssAd.country });
      historyObj.field_name = "country";
      historyObj.old_value = oldVal.value;
      historyObj.new_value = newVal.value;
      History.create(historyObj, () => {});
    }

    if (ssAd && ssAd.state && ssAd.state != req.body.address.start.state) {
      var newVal = await CodeDomainValues.findOne({
        _id: req.body.address.ssAd.state,
      });
      var oldVal = await CodeDomainValues.findOne({ _id: ssAd.state });
      historyObj.field_name = "state";
      historyObj.old_value = oldVal.value;
      historyObj.new_value = newVal.value;
      History.create(historyObj, () => {});
    }

    if (ssAd && ssAd.city != req.body.address.start.city) {
      historyObj.field_name = "city";
      historyObj.old_value = ssAd.city;
      historyObj.new_value = req.body.address.start.city;
      History.create(historyObj, () => {});
    }

    /*KYC Documents*/
    if (apv && apv.url && apv.url != req.body.kyc_doc.apv.url) {
      historyObj.field_name = "url";
      historyObj.old_value = apv.url;
      historyObj.new_value = req.body.kyc_doc.apv.url;
      History.create(historyObj, () => {});
    }

    if (apv && apv.document_id && apv.document_id != req.body.kyc_doc.apv.document_id) {
      historyObj.field_name = "document_id";
      historyObj.old_value = apv.document_id;
      historyObj.new_value = req.body.kyc_doc.apv.document_id;
      History.create(historyObj, () => {});
    }

    if (iec && iec.url && iec.url != req.body.kyc_doc.iec.url) {
      historyObj.field_name = "url";
      historyObj.old_value = iec.url;
      historyObj.new_value = req.body.kyc_doc.iec.url;
      History.create(historyObj, () => {});
    }

    if (iec && iec.document_id && iec.document_id != req.body.kyc_doc.iec.document_id) {
      historyObj.field_name = "document_id";
      historyObj.old_value = iec.document_id;
      historyObj.new_value = req.body.kyc_doc.iec.document_id;
      History.create(historyObj, () => {});
    }

    if (ipc && ipc.url && ipc.url != req.body.kyc_doc.ipc.url) {
      historyObj.field_name = "url";
      historyObj.old_value = ipc.url;
      historyObj.new_value = req.body.kyc_doc.ipc.url;
      History.create(historyObj, () => {});
    }

    if (ipc && ipc.document_id && ipc.document_id != req.body.kyc_doc.ipc.document_id) {
      historyObj.field_name = "document_id";
      historyObj.old_value = ipc.document_id;
      historyObj.new_value = req.body.kyc_doc.ipc.document_id;
      History.create(historyObj, () => {});
    }

    if (uan && uan.url && uan.url != req.body.kyc_doc.uan.url) {
      historyObj.field_name = "url";
      historyObj.old_value = uan.url;
      historyObj.new_value = req.body.kyc_doc.uan.url;
      History.create(historyObj, () => {});
    }

    if (uan && uan.document_id && uan.document_id != req.body.kyc_doc.uan.document_id) {
      historyObj.field_name = "document_id";
      historyObj.old_value = uan.document_id;
      historyObj.new_value = req.body.kyc_doc.uan.document_id;
      History.create(historyObj, () => {});
    }

    /*Trade MemberShip*/
    for (let i = 0; i < req.body.trade_member.length; i++) {
      for (let j = 0; j < TradeMember.length; j++) {
        if (req.body.trade_member[i].id == TradeMember[j]._id) {
          if (TradeMember[j].url != req.body.trade_member[i].url) {
            historyObj.field_name = "url";
            historyObj.old_value = TradeMember[j].url;
            historyObj.new_value = req.body.trade_member[i].url;
            History.create(historyObj, () => {});
          }

          if (
            TradeMember[j].document_id != req.body.trade_member[i].document_id
          ) {
            historyObj.field_name = "document_id";
            historyObj.old_value = TradeMember[j].document_id;
            historyObj.new_value = req.body.trade_member[i].document_id;
            History.create(historyObj, () => {});
          }

          if (
            TradeMember[j].description != req.body.trade_member[i].description
          ) {
            historyObj.field_name = "description";
            historyObj.old_value = TradeMember[j].description;
            historyObj.new_value = req.body.trade_member[i].description;
            History.create(historyObj, () => {});
          }
        }
      }
    }

    // Seller

    if (prf && 
      prf.url && 
      prf.url != req.body.seller.profile.url) {
      historyObj.field_name = "url";
      historyObj.old_value = prf.url;
      historyObj.new_value = req.body.seller.profile.url;
      History.create(historyObj, () => {});
    }

    if (logo && 
      logo.url &&
      logo.url != req.body.seller.logo.url) {
      historyObj.field_name = "url";
      historyObj.old_value = logo.url;
      historyObj.new_value = req.body.seller.logo.url;
      History.create(historyObj, () => {});
    }

    if (bio && 
      bio.url && 
      bio.url != req.body.seller.Biography.url) {
      historyObj.field_name = "url";
      historyObj.old_value = bio.url;
      historyObj.new_value = req.body.seller.Biography.url;
      History.create(historyObj, () => {});
    }

    if (bio && bio.document_id && bio.document_id != req.body.seller.Biography.document_id) {
      historyObj.field_name = "document_id";
      historyObj.old_value = bio.document_id;
      historyObj.new_value = req.body.seller.Biography.document_id;
      History.create(historyObj, () => {});
    }

    console.log(ManufacNarrative);

    if (
      ManufacNarrative &&
      ManufacNarrative.url && 
      ManufacNarrative.url != req.body.Prodcraft.Manufac_Narrative.url
    ) {
      historyObj.field_name = "url";
      historyObj.old_value = ManufacNarrative.url;
      historyObj.new_value = req.body.Prodcraft.Manufac_Narrative.url;
      History.create(historyObj, () => {});
    }

    if (
      ManufacNarrative &&
      ManufacNarrative.document_id && 
      ManufacNarrative.document_id !=
        req.body.Prodcraft.Manufac_Narrative.document_id
    ) {
      historyObj.field_name = "document";
      historyObj.old_value = ManufacNarrative.document_id;
      historyObj.new_value = req.body.Prodcraft.Manufac_Narrative.document_id;
      History.create(historyObj, () => {});
    }

    if (self_intro && 
      self_intro.url &&
      self_intro.url != req.body.Prodcraft.selfIntroVideo.url) {
      historyObj.field_name = "url";
      historyObj.old_value = self_intro.url;
      historyObj.new_value = req.body.Prodcraft.selfIntroVideo.url;
      History.create(historyObj, () => {});
    }

    if (
      self_intro &&
      self_intro.document_id && 
      self_intro.document_id != req.body.Prodcraft.selfIntroVideo.document_id
    ) {
      historyObj.field_name = "document";
      historyObj.old_value = self_intro.document_id;
      historyObj.new_value = req.body.Prodcraft.selfIntroVideo.document_id;
      History.create(historyObj, () => {});
    }

    /*****************/
    // Update  Funstions //
    /*****************/
    Individual.updateOne(
      { _id: req.body.individual.id },
      {
        $set: req.body.individual,
      }
    ).exec((err, result) => {});

    if (
      req.body.marketPlace.proCapacity &&
      req.body.marketPlace.proCapacity.length
    ) {
      for (let i in req.body.marketPlace.proCapacity) {
        if (req.body.marketPlace.proCapacity[i]._id) {
          ProCapacity.updateOne(
            { _id: req.body.marketPlace.proCapacity[i]._id },
            {
              $set: {
                producat_name:
                  req.body.marketPlace.proCapacity[i].producat_name,
                capacity: req.body.marketPlace.proCapacity[i].capacity,
                bussiness: req.body.bussiness.id,
              },
            }
          ).exec((err, result) => {});
        } else {
          ProCapacity.create(
            {
              producat_name: req.body.marketPlace.proCapacity[i].producat_name,
              capacity: req.body.marketPlace.proCapacity[i].capacity,
              bussiness: req.body.bussiness.id,
            },
            () => {}
          );
        }
      }
    }

    ProCategory.deleteMany({
      bussiness: req.body.bussiness.id,
      category: { $nin: req.body.marketPlace.category },
    }).exec((err, result) => {});

    if (req.body.marketPlace.category && req.body.marketPlace.category.length) {
      for (let i in req.body.marketPlace.category) {
        ProCategory.update(
          {
            bussiness: req.body.bussiness.id,
            category: req.body.marketPlace.category[i],
          },
          {
            $set: {
              category: req.body.marketPlace.category[i],
              bussiness: req.body.bussiness.id,
            },
          },
          {
            upsert: true,
          }
        ).exec((err, result) => {
          // console.log(err, result);
        });
      }
    }

    BusMarketPlacecountry.deleteMany({
      bussiness: req.body.bussiness.id,
      country: { $nin: req.body.marketPlace.countries },
    }).exec((err, result) => {});

    if (
      req.body.marketPlace.countries &&
      req.body.marketPlace.countries.length
    ) {
      for (let i in req.body.marketPlace.countries) {
        BusMarketPlacecountry.update(
          {
            bussiness: req.body.bussiness.id,
            country: req.body.marketPlace.countries[i],
          },
          {
            $set: {
              country: req.body.marketPlace.countries[i],
              bussiness: req.body.bussiness.id,
            },
          },
          {
            upsert: true,
          }
        ).exec((err, result) => {
          // console.log(err, result);
        });
      }
    }

    TargatIndustry.deleteMany({
      bussiness: req.body.bussiness.id,
      industry_type: { $nin: req.body.marketPlace.industry_type },
    }).exec((err, result) => {});

    if (
      req.body.marketPlace.industry_type &&
      req.body.marketPlace.industry_type.length
    ) {
      var check = await CodeDomain.findOne({ code: "TBI" });
      var fetch = await CodeDomainValues.findOne({
        deleted: null,
        codedomain: check,
        code: "Others",
      });

      for (let i in req.body.marketPlace.industry_type) {
        TargatIndustry.update(
          {
            bussiness: req.body.bussiness.id,
            industry_type: req.body.marketPlace.industry_type[i],
          },
          {
            $set: {
              industry_type: req.body.marketPlace.industry_type[i],
              bussiness: req.body.bussiness.id,
            },
          },
          {
            upsert: true,
          }
        ).exec((err, result) => {
          // console.log(err, result);
        });

        if (fetch._id == req.body.marketPlace.industry_type[i]) {
          TargatIndustry.update(
            {
              bussiness: req.body.bussiness.id,
              industry_type: req.body.marketPlace.industry_type[i],
            },
            {
              $set: {
                otherIndustry: req.body.marketPlace.otherIndustry,
              },
            },
            {
              upsert: true,
            }
          ).exec((err, result) => {
            // console.log(err, result);
          });
        }
      }
    }

    Bussiness.updateOne(
      { _id: req.body.bussiness.id },
      {
        $set: {
          sell_othr_site: req.body.marketPlace.busuiness.sell_othr_site,
          sell_othr_site_dtl: req.body.marketPlace.busuiness.sell_othr_site_dtl,
        },
      }
    ).exec((err, result) => {});

    if (req.body.bussiness != null) {
      Bussiness.updateOne(
        { _id: req.body.bussiness.id },
        {
          $set: req.body.bussiness,
        }
      ).exec((err, result) => {});
    }

    if (req.body.bus_individual != null) {
      Bussiness_Individual.updateOne(
        { _id: req.body.bus_individual.id },
        {
          $set: req.body.bus_individual,
        }
      ).exec((err, result) => {});
    }

    if (req.body.website.id) {
      URL.updateOne(
        { _id: req.body.website.id },
        { $set: { url: req.body.website.url } }
      ).exec((err, result) => {});
    } else {
      if (req.body.website.url) {
        URL.create(req.body.website, () => {});
      }
    }

    // Emails
    if (req.body.emails.rgem.id != "") {
      EmailAddress.updateOne(
        { _id: req.body.emails.rgem.id },
        {
          $set: { email_add: req.body.emails.rgem.email_add },
        }
      ).exec((err, result) => {});
    } else {
      if (req.body.emails.rgem.id == "") {
        EmailAddress.create(req.body.emails.rgem, () => {});
      }
    }

    if (req.body.emails.bsem.id != "") {
      EmailAddress.updateOne(
        { _id: req.body.emails.bsem.id },
        {
          $set: { email_add: req.body.emails.bsem.email_add },
        }
      ).exec((err, result) => {});
    } else {
      if (req.body.emails.bsem.id == "") {
        EmailAddress.create(req.body.emails.bsem, () => {});
      }
    }

    if (req.body.emails.bsiem.id != "") {
      EmailAddress.updateOne(
        { _id: req.body.emails.bsiem.id },
        {
          $set: { email_add: req.body.emails.bsiem.email_add },
        }
      ).exec((err, result) => {});
    } else {
      if (req.body.emails.bsiem.id == "") {
        EmailAddress.create(req.body.emails.bsiem, () => {});
      }
    }

    if (req.body.emails.bsiem2.id != "") {
      EmailAddress.updateOne(
        { _id: req.body.emails.bsiem2.id },
        {
          $set: { email_add: req.body.emails.bsiem2.email_add },
        }
      ).exec((err, result) => {});
    } else {
      if (req.body.emails.bsiem2.id == "") {
        EmailAddress.create(req.body.emails.bsiem2, () => {});
      }
    }

    // Phone Book start here
    if (req.body.phonebook.rgph.id != "") {
      PhoneBook.updateOne(
        { _id: req.body.phonebook.rgph.id },
        {
          $set: { phone_number: req.body.phonebook.rgph.phone_number },
        }
      ).exec((err, result) => {});
    } else {
      if (req.body.phonebook.rgph.id == "") {
        PhoneBook.create(req.body.phonebook.rgph, () => {});
      }
    }

    if (req.body.phonebook.bsph.id != "") {
      PhoneBook.updateOne(
        { _id: req.body.phonebook.bsph.id },
        {
          $set: { phone_number: req.body.phonebook.bsph.phone_number },
        }
      ).exec((err, result) => {});
    } else {
      if (req.body.phonebook.bsph.id == "") {
        PhoneBook.create(req.body.phonebook.bsph, () => {});
      }
    }

    if (req.body.phonebook.bsiph.id != "") {
      PhoneBook.updateOne(
        { _id: req.body.phonebook.bsiph.id },
        {
          $set: { phone_number: req.body.phonebook.bsiph.phone_number },
        }
      ).exec((err, result) => {});
    } else {
      if (req.body.phonebook.bsiph.id == "") {
        PhoneBook.create(req.body.phonebook.bsiph, () => {});
      }
    }

    if (req.body.phonebook.bsiph2.id != "") {
      PhoneBook.updateOne(
        { _id: req.body.phonebook.bsiph2.id },
        {
          $set: { phone_number: req.body.phonebook.bsiph2.phone_number },
        }
      ).exec((err, result) => {});
    } else {
      if (req.body.phonebook.bsiph2.id == "") {
        PhoneBook.create(req.body.phonebook.bsiph2, () => {});
      }
    }

    if (req.body.phonebook.bstpn.id != "") {
      PhoneBook.updateOne(
        { _id: req.body.phonebook.bstpn.id },
        {
          $set: { phone_number: req.body.phonebook.bstpn.phone_number },
        }
      ).exec((err, result) => {});
    } else {
      if (req.body.phonebook.bstpn.id == "") {
        PhoneBook.create(req.body.phonebook.bstpn, () => {});
      }
    }

    try {
      if (req.body.address.crsad.id != "") {
        Address.updateOne(
          { _id: req.body.address.crsad.id },
          {
            $set: req.body.address.crsad,
          }
        ).exec((err, result) => {});
      } else {
        if (req.body.address.crsad.id == "") {
          Address.create(req.body.address.crsad, () => {});
        }
      }

      if (req.body.address.rgad.id != "") {
        Address.updateOne(
          { _id: req.body.address.rgad.id },
          {
            $set: req.body.address.rgad,
          }
        ).exec((err, result) => {});
      } else {
        if (req.body.address.rgad.id == "") {
          Address.create(req.body.address.rgad, () => {});
        }
      }

      if (req.body.address.crsad.id != "") {
        Address.updateOne(
          { _id: req.body.address.crsad.id },
          {
            $set: req.body.address.crsad,
          }
        ).exec((err, result) => {});
      } else {
        if (req.body.address.crsad.id == "") {
          Address.create(req.body.address.crsad, () => {});
        }
      }

      if (req.body.address.start.id != "") {
        Address.updateOne(
          { _id: req.body.address.start.id },
          {
            $set: req.body.address.start,
          }
        ).exec((err, result) => {});
      } else {
        if (req.body.address.start.id == "") {
          Address.create(req.body.address.start, () => {});
        }
      }
    } catch (eerr) {}

    if (req.body.trade_member.length >= 1) {
      MEDIA.deleteMany({
        Doc_type: "TYP1",
        individual: req.body.individual.id,
      }).exec((err, result) => {});
      for (let i = 0; i < req.body.trade_member.length; i++) {
        req.body.trade_member[i].individual = req.body.individual.id;
        MEDIA.create(req.body.trade_member[i], () => {});
      }
    }

    if (req.body.kyc_doc.apv.id != "") {
      MEDIA.updateOne(
        { _id: req.body.kyc_doc.apv.id },
        {
          $set: req.body.kyc_doc.apv,
        }
      ).exec((err, result) => {});
    } else {
      MEDIA.create(req.body.kyc_doc.apv, () => {});
    }

    if (req.body.kyc_doc.iec.id != "") {
      MEDIA.updateOne(
        { _id: req.body.kyc_doc.iec.id },
        {
          $set: req.body.kyc_doc.iec,
        }
      ).exec((err, result) => {});
    } else {
      MEDIA.create(req.body.kyc_doc.iec, () => {});
    }

    if (req.body.kyc_doc.ipc.id != "") {
      MEDIA.updateOne(
        { _id: req.body.kyc_doc.ipc.id },
        {
          $set: req.body.kyc_doc.ipc,
        }
      ).exec((err, result) => {});
    } else {
      MEDIA.create(req.body.kyc_doc.ipc, () => {});
    }

    if (req.body.kyc_doc.uan.id != "") {
      MEDIA.updateOne(
        { _id: req.body.kyc_doc.uan.id },
        {
          $set: req.body.kyc_doc.uan,
        }
      ).exec((err, result) => {});
    } else {
      MEDIA.create(req.body.kyc_doc.uan, () => {});
    }

    // Seller Start here
    if (req.body.seller.profile.id != "") {
      console.log("111111.profile>>>",req.body.seller.profile)
      MEDIA.updateOne(
        { _id: req.body.seller.profile.id },
        {
          $set: req.body.seller.profile,
        }
      ).exec((err, result) => {});
    } else {
      console.log("222222.profile>>>",req.body.seller.profile)
      if (!req.body.seller.profile.individual) {
        req.body.seller.profile.individual = null;
      }
      MEDIA.create(req.body.seller.profile, () => {});
    }

    if (req.body.seller.logo.id != "") {
      MEDIA.updateOne(
        { _id: req.body.seller.logo.id },
        {
          $set: req.body.seller.logo,
        }
      ).exec((err, result) => {});
    } else {
      if (!req.body.seller.logo.individual) {
        req.body.seller.logo.individual = null;
      }
      MEDIA.create(req.body.seller.logo, () => {});
    }
    if (req.body.seller.Biography.id != "") {
      MEDIA.updateOne(
        { _id: req.body.seller.Biography.id },
        {
          $set: req.body.seller.Biography,
        }
      ).exec((err, result) => {});
    } else {
      if (!req.body.seller.Biography.individual) {
        req.body.seller.Biography.individual = null;
      }
      MEDIA.create(req.body.seller.Biography, () => {});
    }

    MEDIA.deleteMany({
      Doc_type: "AWARDS",
      individual: req.body.individual.id,
    }).exec((err, result) => {});
    MEDIA.deleteMany({
      Doc_type: "SELFATTESTED_DOCUMENTS",
      individual: req.body.individual.id,
    }).exec((err, result) => {});
    MEDIA.deleteMany({
      Doc_type: "PRDPHOTO_CRAFT",
      individual: req.body.individual.id,
    }).exec((err, result) => {});
    MEDIA.deleteMany({
      Doc_type: "PRDVIDEO_CRAFT",
      individual: req.body.individual.id,
    }).exec((err, result) => {});

    // Loop functions Start here
    if (req.body.seller.documents.length >= 1) {
      for (let i = 0; i < req.body.seller.documents.length; i++) {
        req.body.seller.documents[i].individual = req.body.individual.id;

        if (!req.body.seller.documents[i].individual) {
          req.body.seller.documents[i].individual = null;
        }
        MEDIA.create(req.body.seller.documents[i], () => {});
      }
    }

    if (req.body.seller.awards.length >= 1) {
      for (let i = 0; i < req.body.seller.awards.length; i++) {
        req.body.seller.awards[i].individual = req.body.individual.id;
        if (!req.body.seller.awards[i].individual) {
          req.body.seller.awards[i].individual = null;
        }
        MEDIA.create(req.body.seller.awards[i], () => {});
      }
    }

    if (req.body.Prodcraft.prodPhotoCraf.length >= 1) {
      for (let i = 0; i < req.body.Prodcraft.prodPhotoCraf.length; i++) {
        req.body.Prodcraft.prodPhotoCraf[i].individual = req.body.individual.id;

        if (!req.body.Prodcraft.prodPhotoCraf[i].individual) {
          req.body.Prodcraft.prodPhotoCraf[i].individual = null;
        }
        MEDIA.create(req.body.Prodcraft.prodPhotoCraf[i], () => {});
      }
    }

    if (req.body.Prodcraft.prodVideoCraf.length >= 1) {
      for (let i = 0; i < req.body.Prodcraft.prodVideoCraf.length; i++) {
        req.body.Prodcraft.prodVideoCraf[i].individual = req.body.individual.id;
        if (!req.body.Prodcraft.prodVideoCraf[i].individual) {
          req.body.Prodcraft.prodVideoCraf[i].individual = null;
        }
        MEDIA.create(req.body.Prodcraft.prodVideoCraf[i], () => {});
      }
    }
    // Loop functions END here

    if (req.body.Prodcraft.Manufac_Narrative.id != "") {
      MEDIA.updateOne(
        { _id: req.body.Prodcraft.Manufac_Narrative.id },
        {
          $set: req.body.Prodcraft.Manufac_Narrative,
        }
      ).exec((err, result) => {});
    } else {
      if (!req.body.Prodcraft.Manufac_Narrative.individual) {
        req.body.Prodcraft.Manufac_Narrative.individual = null;
      }
      MEDIA.create(req.body.Prodcraft.Manufac_Narrative, () => {});
    }

    if (req.body.Prodcraft.selfIntroVideo.id != "") {
      MEDIA.updateOne(
        { _id: req.body.Prodcraft.selfIntroVideo.id },
        {
          $set: req.body.Prodcraft.selfIntroVideo,
        }
      ).exec((err, result) => {});
    } else {
      if (!req.body.Prodcraft.selfIntroVideo.individual) {
        req.body.Prodcraft.selfIntroVideo.individual = null;
      }
      MEDIA.create(req.body.Prodcraft.selfIntroVideo, () => {});
    }
    // Seller End here

    if (req.body.pan.id != "") {
      MEDIA.updateOne(
        { _id: req.body.pan.id },
        {
          $set: req.body.pan,
        }
      ).exec((err, result) => {});
    } else {
      MEDIA.create(req.body.pan, () => {});
    }

    if (req.body.gst.id != "") {
      MEDIA.updateOne(
        { _id: req.body.gst.id },
        {
          $set: req.body.gst,
        }
      ).exec((err, result) => {});
    } else {
      MEDIA.create(req.body.gst, () => {});
    }

    if (req.body.kyc_doc.uan.id != "") {
      MEDIA.updateOne(
        { _id: req.body.kyc_doc.uan.id },
        {
          $set: req.body.kyc_doc.uan,
        }
      ).exec((err, result) => {});
    } else {
      MEDIA.create(req.body.kyc_doc.uan, () => {});
    }

    if (req.body.bank.id != "") {
      Bank.updateOne(
        { _id: req.body.bank.id },
        {
          $set: req.body.bank,
        }
      ).exec((err, result) => {});
    } else {
      Bank.create(req.body.bank, () => {});
    }
    var userStatus = await Individual.findOne({ _id: req.body.individual.id },{seller_status:true});
    try {
      var cd = await CodeDomain.findOne({ code: "WRK_STS" });
      var cdv = await CodeDomainValues.findOne({
        deleted: null,
        codedomain: cd,
        code: userStatus.seller_status,
      });
      var fetch = await RelatedCodeDomain.findOne({
        deleted: null,
        codedomain1: cd._id,
        codedomain_values1: cdv._id,
      });
      var cdv = await CodeDomainValues.findOne({
        deleted: null,
        _id: fetch.codedomain_values2,
      });
      crStatus = cdv.value;
    } catch (rrr) {
      crStatus = "In Review";
    }

    res.json({ message: "success", seller_status: userStatus.seller_status, currentStatus:crStatus });
  }
});

//short data of individual
router.get("/getByid/:id", async function (req, res, next) {
  var ind = await Individual.findOne({ _id: req.params.id });
  var usr = await User.findOne({ individual: req.params.id });
  res.json({ message: "success", data: ind, user: usr });
});

// get Seller By id
router.get("/getBySeller/:id", async function (req, res, next) {
  var ur = await Individual.find({
    deleted: null,
    _id: req.params.id,
  }).populate("phonebook email_address");
  res.json({ message: "success", data: ur });
});

// delete
router.delete("/:id", async function (req, res, next) {
  console.log("req.params>>",req.params);
  // var urUp = await Individual.updateOne(
  //   {
  //     _id: req.params.id,
  //   },
  //   {
  //     $set: {
  //       deleted: new Date().getTime(),
  //     },
  //   }
  // ).exec((err, result) => {
  // });
  

  Individual.updateOne(
    { _id: req.params.id },
    {
        $set: {
            deleted: new Date().getTime(),
        },
    }
  ).exec((err, result) => {});

  EmailAddress.updateOne(
    { individual: req.params.id,code:"RGEM" },
    {
      $set: { deleted: new Date().getTime() },
    }
  ).exec((err, result) => {
    console.log("EmailAddress>>",result);
  });
  PhoneBook.updateOne(
    { individual: req.params.id, code:"RGPH" },
    {
      $set: { deleted: new Date().getTime() },
    }
  ).exec((err, result) => {
    console.log("PhoneBook>>",result);
  });

  res.json({
    message: "success"
  });
});

//signin
router.post("/signin", async function (req, res, next) {
  rand = Math.floor(Math.random() * 2000 + 999);

  var isExist = await User.findOne({ username: req.body.email }).sort({
    createdAt: -1,
  });
  if (isExist) {
    var ind = await Individual.findOne({ _id: isExist.individual })
      .populate({ path: "email_address", select: "email_add" })
      .lean();

    if (ind && ind.seller_status) {
      try {
        var cd = await CodeDomain.findOne({ code: "WRK_STS" });
        var cdv = await CodeDomainValues.findOne({
          deleted: null,
          codedomain: cd,
          code: ind.seller_status,
        });
        var fetch = await RelatedCodeDomain.findOne({
          deleted: null,
          codedomain1: cd._id,
          codedomain_values1: cdv._id,
        });
        var cdv = await CodeDomainValues.findOne({
          deleted: null,
          _id: fetch.codedomain_values2,
        });
        ind.sellerRole = cdv.value;
        ind.status_code = cdv.code;
        console.log("fetch.codedomain_values2>>>",fetch.codedomain_values2)
      } catch (rrr) {
        ind.sellerRole = "In Review";
      }
    }

    if (ind && ind.seller_status == "NVA") {
      res.json({ message: "OTP panding" });
      return true;
    }

    var userrole = await userRole.findOne(
      { userId: isExist.individual },
      { _id: true, roleId: true, userId: true }
    );
    if (userrole) {
      var role = await roleModel.findOne({ _id: userrole.roleId });
      if (role) {
        ind.NewRole = role.name;
      }
    }

    if (ind && ind.email_address) {
      ind.email_add = ind.email_address.email_add;
      ind.email_address = ind.email_address._id;
    }
    var img = await MEDIA.findOne({
      individual: isExist.individual,
      Doc_type: "PRF",
    });
    if (img) {
      ind.userPofile = img.url;
    }
    const isAuth = passwordHash.verify(req.body.password, isExist.password);
    if (isAuth) {
      const token = jwt.sign(
        { _id: req.body.email, id: isExist._id },
        "hello",
        { expiresIn: "365d" }
      );

      // dynamicEmail(req.body.email, rand);

      globalService.attampLogin(req, ind, (attampLogin) => {});

      req.session.user = ind;
      console.log(req.session.user);

      return res.json({
        token: token,
        data: ind,
        message: "success",
        code: rand,
      });
    } else {
      // Login Attand
      globalService.attampLogin(req, {}, (attampLogin) => {});

      res.json({ message: "Un Authorized" });
    }
  } else {
    // Login Attand
    globalService.attampLogin(req, 0, {}, (attampLogin) => {});

    res.json({ message: "Un Authorized" });
  }
});

//resend OTP
router.post("/resendOTP", async function (req, res, next) {
  let rand = Math.floor(Math.random() * 2000 + 999);

  var isExist = await EmailAddress.findOne({
    email_type: "personal",
    email_add: req.body.email,
    code: "RGEM",
  });

  if (isExist) {
    let body = {
      userId: isExist.individual,
      otp: rand,
    };

    globalService.saveOtp({
      otp_type: 'registration',
      otp_medium_type: 'email',
      otp: rand,
      email_add_id: req.body.email,
      individual: isExist.individual
    });

    globalService.emailTemplateSend("Resend Otp", body, (eventTemplate) => {});

    return res.json({
      message: "success",
      code: rand,
    });
  } else {
    res.json({ message: "Un Authorized" });
  }
});

//forget password
router.post("/forgetPasswardOtp", async function (req, res, next) {
  let rand = Math.floor(Math.random() * 2000 + 999);

  var isExist = await EmailAddress.findOne({
    email_type: "personal",
    email_add: req.body.email,
    code: "RGEM",
  });

  if (isExist) {
    let body = {
      userId: isExist.individual,
      otp: rand,
    };

    globalService.emailTemplateSend(
      "Forgot Password",
      body,
      (eventTemplate) => {}
    );

    globalService.saveOtp({
      otp_type: 'forgotPassword',
      otp_medium_type: 'email',
      otp: rand,
      email_add_id: req.body.email,
    });

    return res.json({
      message: "success",
      code: rand,
    });
  } else {
    res.json({ message: "Un Authorized" });
  }
});


//forget password
router.post("/forgetPasswardVerifyOtp", async function (req, res, next) {

   let fetch = await OTP.findOne({
      otp_type: 'forgotPassword',
      otp_medium_type: 'email',
      otp: req.body.otp,
      email_add_id: req.body.email,
   });

   if (!fetch) {
     return res.json({
      status: false,
      message: "OTP not valid",
    });
   }

   if (new Date(fetch.otp_expire_ts) < new Date()) {
     return res.json({
      status: false,
      message: "OTP is expired!",
    });
   }

   res.json({
      status: true,
      message: "OTP Matched successfully",
    });
});

// Update ProfileImage
router.post("/update/profileImage", async function (req, res, next) {
  Individual.updateOne(
    { _id: req.body.id },
    {
      $set: { profile: req.body.profile },
    }
  ).exec((err, result) => {});

  var ind = await Individual.findOne({ _id: req.body.id });

  res.json({ message: "success", data: ind });
});

// reset Password
router.post("/reset/password", async function (req, res, next) {
  req.body.password = passwordHash.generate(req.body.password);

  var isExistEmail = await EmailAddress.findOne({
    email_type: "personal",
    email_add: req.body.email,
    code: "RGEM",
  });

  User.updateOne(
    { individual: isExistEmail.individual },
    {
      $set: { password: req.body.password },
    }
  ).exec((err, result) => {});

  res.json({ message: "success" });
});

// update profile

router.post("/update/profile", async function (req, res, next) {
  var fetchUser = await User.findOne({ individual: req.body.id });
  var fetchInd = await Individual.findOne({ _id: req.body.id });

  if (req.body.new != "") {
    req.body.new = passwordHash.generate(req.body.new);
  }

  var ObjInd = {
    firstname: req.body.firstname,
    middlename: req.body.middlename,
    lastname: req.body.lastname,
  };

  var ObjUser = {
    password: req.body.new == "" ? fetchInd.password : req.body.new,
    username: req.body.email == "" ? fetchUser.username : req.body.email,
  };

  if (req.body.new == "" && req.body.old == "") {
    Individual.updateOne(
      { _id: req.body.id },
      {
        $set: ObjInd,
      }
    ).exec((err, result) => {});
    User.updateOne(
      { individual: req.body.id },
      {
        $set: ObjUser,
      }
    ).exec((err, result) => {});
    var Ind = await Individual.findOne({ _id: req.body.id });
    res.json({
      message: "Password updated successfully",
      status: true,
      data: Ind,
    });
  } else {
    const isAuth = passwordHash.verify(req.body.old, fetchUser.password);
    if (isAuth) {
      Individual.updateOne(
        { _id: req.body.id },
        {
          $set: ObjInd,
        }
      ).exec((err, result) => {});

      User.updateOne(
        { individual: req.body.id },
        {
          $set: ObjUser,
        }
      ).exec((err, result) => {});

      var Ind = await Individual.findOne({ _id: req.body.id });
      res.json({
        message: "Password updated successfully",
        status: true,
        data: Ind,
      });
    } else {
      res.json({ message: "Current password is not matched", status: false });
    }
  }
});

// ------------------------
// Prospect section
// ------------------------

// Get All Prospects Seller
// router.post("/getSellerList", async function (req, res, next) {
//   globalService.getByPageWFS(req, async (keyList) => {
//     if (req.body && req.body.individual) {
//       var ur = await Individual.find({
//         _id: req.body.individual,
//         deleted: null,
//         seller_status: { $in: keyList },
//       })
//         .populate("phonebook email_address")
//         .lean();
//     } else {
//       var ur = await Individual.find({
//         deleted: null,
//         seller_status: { $in: keyList },
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
// });


// // Get All Seller List
// router.post("/getAllSellerList", async function (req, res, next) {
//   var ur = await Individual.find({ deleted: null }).populate("phonebook email_address").lean();
//   let ii = [];

//   for (let i in ur) {
//     ii.push(ur[i]._id);
//   }

//   var assign = await USAssignment.find(
//     { parent_entity_id: { $in: ii } },
//     { keyidentifier_value: true, parent_entity_id: true }
//   );

//   for (let i in ur) {
//     for (let as in assign) {
//       if (assign[as].parent_entity_id == ur[i]._id) {
//         ur[i].assignTo = assign[as].keyidentifier_value;
//       }
//     }
//   }

//   var bus = await Bussiness.find(
//     { individual: {$in: ii} },
//     { individual: true, bus_name: true, bus_ownership: true }
//   );

//   for (let i in ur) {
//     for (let as in bus) {
//       if (''+bus[as].individual == ''+ur[i]._id) {
//         ur[i].bus_name = bus[as].bus_name;
//       }
//     }
//   }

//   res.json({ message: "success", data: ur });
// });


// Get All Seller List
router.post("/getAllSellerList", async function (req, res, next) {

  var userrole = await userRole.findOne({ userId: req.body.userId });
  var rolem = await roleModel.findOne({ _id: userrole.roleId });

  if (rolem.name == 'Super Admin' || rolem.name == 'Admin') {

      var ur = await Individual.find({ deleted: null }).populate("phonebook email_address").lean().sort({ createdAt: -1 });
      let ii = [];

      for (let i in ur) {
        ii.push(ur[i]._id);
      }


       var assign = await USAssignment.find(
            { parent_entity_id: { $in: ii } },
            { keyidentifier_value: true, parent_entity_id: true,parent_entity_name:"Individual" }
          );

          for (let i in ur) {
            for (let as in assign) {
              if (assign[as].parent_entity_id == ur[i]._id) {
                ur[i].assignTo = assign[as].keyidentifier_value;
              }
            }
          }


      var bus = await Bussiness.find(
        { individual: {$in: ii} },
        { individual: true, bus_name: true, bus_ownership: true }
      );

      for (let i in ur) {
        for (let as in bus) {
          if (''+bus[as].individual == ''+ur[i]._id) {
            ur[i].bus_name = bus[as].bus_name;
          }
        }
      }

      res.json({ message: "success", data: ur });

  } else {
  
      if(req.body.showunassignuser) {

          var ur = await Individual.find({ deleted: null }).populate("phonebook email_address").lean();
          let ii = [];

          for (let i in ur) {
            ii.push(ur[i]._id);
          }

          var assign = await USAssignment.find(
            { parent_entity_id: { $in: ii } },
            { keyidentifier_value: true, parent_entity_id: true,parent_entity_name:"Individual" }
          );

          for (let i in ur) {
            for (let as in assign) {
              if (assign[as].parent_entity_id == ur[i]._id) {
                ur[i].assignTo = assign[as].keyidentifier_value;
              }
            }
          }

          var bus = await Bussiness.find(
            { individual: {$in: ii} },
            { individual: true, bus_name: true, bus_ownership: true }
          );

          for (let i in ur) {
            for (let as in bus) {
              if (''+bus[as].individual == ''+ur[i]._id) {
                ur[i].bus_name = bus[as].bus_name;
              }
            }
          }

          res.json({ message: "success", data: ur });
      } else {
      let ii = [];
      let jj = [];
      let statuss = [];
      let srvassignList = await USAssignment.find(
        { deleted: null , assing_user_id : req.body.userId,parent_entity_name:"Individual"}
      );

      for (let i in srvassignList) {
          ii.push(srvassignList[i].parent_entity_id);
      }

      var createdmy = await User.find({
          deleted: null,create_user: req.body.userId 
      });
      
      for (let j in createdmy) {
          ii.push(createdmy[j].individual);
      }

      var ur = await Individual.find({
          deleted: null,_id: { $in: ii },
      })
      .populate("phonebook email_address")
      .lean();

        
      var bus = await Bussiness.find(
        { individual: { $in: ii } },
        { bus_name: true }
      );

      for (let i in ur) {
        for (let j in bus) {
          if (bus[j].bus_name && bus[j].individual == ur[i]._id) {
            ur[i].bus_name = bus[j].bus_name;
          }
        }
      }

      for (let i in ur) {         
        statuss.push(ur[i].seller_status);
      }


      let check = await CodeDomainValues.find(
        { status: "active", deleted: null, code: { $in: statuss } },
        { value: true, code: true }
      ).sort({position:1,value:1});

      for (let j in ur) {
        for (let k in check) {
          if (check[k].code == ur[j].seller_status) {
            ur[j].seller_status = check[k].value;
          }
        }
      }

      res.json({ message: "success", data: ur });
      }
  }
});


router.post("/getSellerList", async function (req, res, next) {
  // globalService.getAll(req.body,(data) => {

  // });

  var userrole = await userRole.findOne({ userId: req.body.userId });
  var rolem = await roleModel.findOne({ _id: userrole.roleId });
  if (rolem.name == 'Super Admin' || rolem.name == 'Admin') {

      globalService.getByPageWFS(req, async (keyList) => {
             let ii = [];
        var ur = await Individual.find({
          deleted: null,
          seller_status: { $in: keyList },
        })
        .populate("phonebook email_address")
        .lean();

        for (let i in ur) {
          ii.push(ur[i]._id);
        }

        // New 
        
           var assign = await USAssignment.find(
            { parent_entity_id: { $in: ii } },
            { keyidentifier_value: true, parent_entity_id: true,parent_entity_name:"Individual"}
          );

          for (let i in ur) {
            for (let as in assign) {
              if (assign[as].parent_entity_id == ur[i]._id) {
                ur[i].assignTo = assign[as].keyidentifier_value;
              }
            }
          }

        // New End

        var bus = await Bussiness.find(
          { individual: { $in: ii } },
          { bus_name: true }
        );

        for (let i in ur) {
          for (let j in bus) {
            if (bus[j].bus_name && bus[j].individual == ur[i]._id) {
              ur[i].bus_name = bus[j].bus_name;
            }
          }
        }

        let statuss = [];
        for (let i in ur) {         
        statuss.push(ur[i].seller_status);
        }


        let check = await CodeDomainValues.find(
          { status: "active", deleted: null, code: { $in: statuss } },
          { value: true, code: true }
        ).sort({position:1,value:1});

        for (let j in ur) {
          for (let k in check) {
            if (check[k].code == ur[j].seller_status) {
              ur[j].seller_status = check[k].value;
            }
          }
          }
        res.json({ message: "success", data: ur });
      });
     

  } else {
    if(req.body.showunassignuser) {

        globalService.getByPageWFS(req, async (keyList) => {


      let assignuserList = [];
      let srvassignList = await USAssignment.find(
        { deleted: null,parent_entity_name:"Individual"}
      );

      for (let i in srvassignList) {
          assignuserList.push(srvassignList[i].parent_entity_id);
      }


      if (req.body && req.body.individual) {
        var ur = await Individual.find({
          _id: req.body.individual,
          deleted: null,
          seller_status: { $in: keyList },
          // _id: { $nin: assignuserList },


        })
          .populate("phonebook email_address")
          .lean();
      } else {
        var ur = await Individual.find({
          deleted: null,
          seller_status: { $in: keyList },
          // _id: { $nin: assignuserList },
        })
          .populate("phonebook email_address")
          .lean();
      }


      let ii = [];
      let statuss = [];
      if(ur) {
        for (let i in ur) {
          ii.push(ur[i]._id);
          statuss.push(ur[i].seller_status);
        }

        let check = await CodeDomainValues.find(
          { status: "active", deleted: null, code: { $in: statuss } },
          { value: true, code: true }
        ).sort({position:1,value:1});

        for (let i in ur) {
          for (let k in check) {
            if (check[k].code == ur[i].seller_status) {
              ur[i].seller_status = check[k].value;
            }
          }
        }

        var assign = await USAssignment.find(
          { parent_entity_id: { $in: ii } },
          { keyidentifier_value: true, parent_entity_id: true,parent_entity_name:"Individual"}
        );
        let ids = [];

        for (let i in ur) {
          for (let as in assign) {
            if (assign[as].parent_entity_id == ur[i]._id) {
              ur[i].assignTo = assign[as].keyidentifier_value;
            }
          }
          ids.push(ur[i]._id);
        }

        var bus = await Bussiness.find(
          { individual: { $in: ids } },
          { bus_name: true }
        );

        for (let i in ur) {
          for (let j in bus) {
            if (bus[j].bus_name && bus[j].individual == ur[i]._id) {
              ur[i].bus_name = bus[j].bus_name;
            }
          }
        }
      }
      res.json({ message: "success", data: ur });
    });
    } else {

    globalService.getByPageWFS(req, async (keyList) => {

      let ii = [];
      let jj = [];
      let statuss = [];
      let srvassignList = await USAssignment.find(
        { deleted: null , assing_user_id : req.body.userId,parent_entity_name:"Individual"}
      );

      for (let i in srvassignList) {
          ii.push(srvassignList[i].parent_entity_id);
      }


      // var domValue_new = await CodeDomainValues.findOne({ _id: req.body.packaging_type, $or: [{ deleted: null }, { deleted: "no" }] })


      var createdmy = await User.find({
          deleted: null,create_user: req.body.userId 
      });
      
      for (let j in createdmy) {
          ii.push(createdmy[j].individual);
      }

      var ur = await Individual.find({
          deleted: null,_id: { $in: ii } ,seller_status: { $in: keyList },
      })
      .populate("phonebook email_address")
      .lean();

        
      var bus = await Bussiness.find(
        { individual: { $in: ii } },
        { bus_name: true }
      );

      for (let i in ur) {
        for (let j in bus) {
          if (bus[j].bus_name && bus[j].individual == ur[i]._id) {
            ur[i].bus_name = bus[j].bus_name;
          }
        }
      }

      for (let i in ur) {         
        statuss.push(ur[i].seller_status);
      }


      let check = await CodeDomainValues.find(
        { status: "active", deleted: null, code: { $in: statuss } },
        { value: true, code: true }
      ).sort({position:1,value:1});

      for (let j in ur) {
        for (let k in check) {
          if (check[k].code == ur[j].seller_status) {
            ur[j].seller_status = check[k].value;
          }
        }
      }

      res.json({ message: "success", data: ur });

    });

    }
   
  }
});


// OTP Verfication Seller
router.post("/otpVerficationSeller", async function (req, res, next) {

  let fetch = await OTP.findOne({
    otp_type: 'registration',
    otp_medium_type: 'email',
    otp: req.body.otp,
    individual: req.body.id,
   });

   if (!fetch) {
     return res.json({
      status: false,
      message: "OTP not valid",
    });
   }

   if (new Date(fetch.otp_expire_ts) < new Date()) {
     return res.json({
      status: false,
      message: "OTP is expired!",
    });
   }

  Individual.updateOne(
    { _id: req.body.id },
    {
      $set: { seller_status: req.body.seller_status },
    }
  ).exec((err, result) => {});

  res.json({ status: true, message: "success" });
});

// Update status
router.post("/statusUpdate", async function (req, res, next) {
  Individual.updateOne(
    { _id: req.body.id },
    {
      $set: { seller_status: req.body.seller_status },
    }
  ).exec((err, result) => {});

  let body = {
    userId: req.body.id,
  };

  globalService.emailTemplateSend(req.body.eventType, body, (eventTemplate) => {
    res.json({ message: "success" });
  });
});

// Update status
router.post("/rejectSeller", async function (req, res, next) {
  Individual.updateOne(
    { _id: req.body.id },
    {
      $set: {
        status_reason: req.body.status_reason,
        reason_descreption: req.body.reason_descreption,
        seller_status: req.body.seller_status,
      },
    }
  ).exec((err, result) => {});

  // Rajnikant Start Code

  let body = {
    userId: req.body.id,
  };

  if (req.body.seller_status == "NTQLIFDPROS") {
    req.body.seller_status = "Reject as Prospect";
  }

  if (req.body.seller_status == "NTQLIFDLD") {
    req.body.seller_status = "Reject as Lead";
  }

  if (req.body.seller_status == "NTQLIFDREG") {
    req.body.seller_status = "Reject as Registration";
  }

  if (req.body.seller_status == "ONBRDREJ") {
    req.body.seller_status = "Reject as Onboarding";
  }

  if (req.body.seller_status == "ACTSUSPND") {
    req.body.seller_status = "Account suspend";
  }

  globalService.emailTemplateSend(
    req.body.seller_status,
    body,
    (eventTemplate) => {
      res.json({ message: "success" });
    }
  );
  // Rajnikant End Code
});

// getAll Seller
router.get("/getAll", async function (req, res, next) {
  var ur = await Individual.find({ deleted: null }).populate(
    "phonebook email_address"
  ).sort({ createdAt: -1 });
  res.json({ message: "success", data: ur });
});

// getAll Seller
router.get("/getAll/getAllForAdmin", async function (req, res, next) {
  var ur = await Individual.find({ deleted: null }).populate(
    "phonebook email_address"
  ).sort({ createdAt: -1 });
  res.json({ message: "success", data: ur });
});

// getAll Seller
router.get("/getAll/prospect/:id", async function (req, res, next) {


  var check = await User.find({ deleted: null,parent_user: req.params.id }).sort({ createdAt: -1 });
  let ii = [];

  for (let i in check) {
    ii.push(check[i].individual);
  }

  var fetch = await Individual.find({ deleted: null, _id: { $in: ii }  });

  // var ur = await Individual.find({ deleted: null }).populate(
  //   "phonebook email_address"
  // );
  res.json({ message: "success", data: fetch });
});

// get Reason
router.post("/fetch/reason", async function (req, res, next) {
  var check = await CodeDomain.findOne({ code: "Reason" });
  var fetch = await CodeDomainValues.find({ deleted: null,status:"active", codedomain: check }).sort({position:1,value:1});
  res.json({ message: "success", data: fetch });
});

// Get single prospect

router.all("/prospect/:id", async (req, res, next) => {
  var prospect = await Individual.findOne({ _id: req.params.id, deleted: null }).populate("phonebook email_address").lean();
  
  if (prospect) {
    var check = await CodeDomainValues.findOne(
      { status: "active", deleted: null, code: prospect.seller_status },
      { value: true }
    ).sort({position:1,value:1});
    if (check) {
      prospect.tempStatus = check.value;
    }
  }

  var check = await CodeDomain.find({ code: "SMR" });
  var fetch = await CodeDomainValues.find({ deleted: null,status:"active", codedomain: check }).sort({position:1,value:1});

  // Document list
  let attachementArray = [];
  let docType = [
    "IEC",
    "IPC",
    "APV",
    "UAN",
    "Pan Numer",
    "GST Numer",
    "TYP1",
    "PRF",
    "LOGO",
    "BIO",
    "SELFATTESTED_DOCUMENTS",
    "AWARDS",
    "ManuNarr",
    "SLFINTRO_PROD",
    "PRDPHOTO_CRAFT",
    "PRDVIDEO_CRAFT",
  ];
  var docList = await MEDIA.find({
    individual: req.params.id,
    status: "active",
    url: { $ne: "" },
    Doc_type: { $in: docType },
  });

  for (let i in docList) {
    attachementArray.push(docList[i]);
  }

  var bus = await Bussiness.findOne(
    { individual: req.params.id },
    { bus_name: true, bus_ownership: true }
  );
  if (prospect && bus) {
    prospect.bus_ownership = bus.bus_ownership;
    prospect.bus_name = bus.bus_name;
    prospect.bus_id = bus._id;
  }

  res.json({
    message: "success",
    data: prospect,
    source: fetch,
    Attachements: attachementArray,
  });
});

// Update Prospect
router.all("/prospect-update", async (req, res, next) => {

  console.log("welcome >>>> prospect",req.body);

  if (req.body.id) {
    var isExistEmail = await EmailAddress.findOne({
      email_type: "personal",
      email_add: req.body.email,
      code: "RGEM",
      individual: { $ne: req.body.id },
      deleted: null,
    });
    var isExistPhone = await PhoneBook.findOne({
      phone_type: "personal",
      phone_number: req.body.phone_number,
      code: "RGPH",
      individual: { $ne: req.body.id },
      deleted: null,
    });
    if (isExistPhone) {
      res.json({ message: "already phone" });
      return;
    }
    if (isExistEmail) {
      res.json({ message: "already email" });
      return;
    }

    let individual = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      middlename: req.body.middlename,
      status: "active",
      seller_status: req.body.seller_status,
      registration_source: req.body.registration_source,
      registration_source_other: req.body.registration_source_other,
    };

    let emailadd = {
      email_add: req.body.email,
    };

    let phonebook = {
      phone_number: req.body.phone_number,
    };
    console.log('req.body',req.body);
    let bussinesses = {
      bus_name: req.body.bus_name,
      bus_ownership: req.body.bus_ownership
      
    };
    var historyObj = {
      parent_entity_name: req.body.parent_entity_name,
      context_entity_name: "", // (eg.user event) can be null
      field_name: "",
      old_value: "", // (sharma)
      new_value: "", // (verma)
      history_type: "edit", // (view / edit / list / add)
      user_session_id: "",
      status: "active",
      deleted: null,
      editedby: req.body.id,
      individual: req.body.id,
      business: req.body.bus_id,
      product: null,
      service: null,
    };

    let user = await Individual.findOne({ _id: req.body.id });
    let bussiness = await Bussiness.findOne({ individual: req.body.id });

    if(!bussiness){
      let bussinesses = {
        bus_name: req.body.bus_name,
        bus_ownership:
          req.body.bus_ownership != "Artisan"
            ? "Publicly-owned business"
            : "Artisan",
        individual: req.body.id,
      };
  
      bussiness = await Bussiness.create(bussinesses);
    }

    let emailB = await EmailAddress.findOne({ individual: req.body.id });
    let phoneB = await PhoneBook.findOne({ individual: req.body.id });

    if (user.firstname != req.body.firstname) {
      historyObj.field_name = "First name";
      historyObj.old_value = user.firstname;
      historyObj.new_value = req.body.firstname;
      History.create(historyObj, () => {});
    }
    if (user.middlename != req.body.middlename) {
      historyObj.field_name = "Middle Name";
      historyObj.old_value = user.middlename;
      historyObj.new_value = req.body.middlename;
      History.create(historyObj, () => {});
    }
    if (user.lastname != req.body.lastname) {
      historyObj.field_name = "Last Name";
      historyObj.old_value = user.lastname;
      historyObj.new_value = req.body.lastname;
      History.create(historyObj, () => {});
    }
    if (
      req.body.registration_source != "" ||
      req.body.registration_source != null
      ) {
        if (user.registration_source != req.body.registration_source) {
          var fetch = await CodeDomainValues.findOne({_id:req.body.registration_source},{value:true});
          var fetch2 = await CodeDomainValues.findOne({_id:user.registration_source},{value:true});
          if(fetch)
          historyObj.field_name = "Source";
          historyObj.old_value = fetch2.value;
          historyObj.new_value = fetch.value;
          History.create(historyObj, () => {});
        }
    }
    if (bussiness.bus_name != req.body.bus_name) {
      historyObj.field_name = "Business Name";
      historyObj.old_value = bussiness.bus_name;
      historyObj.new_value = req.body.bus_name;
      History.create(historyObj, () => {});
    }
    if (bussiness.bus_ownership) {
      bussiness.bus_ownership =
        bussiness.bus_ownership != "Artisan"
          ? "Business"
          : bussiness.bus_ownership;
      if (bussiness.bus_ownership != req.body.bus_ownership) {
        historyObj.field_name = "Business Entity Type";
        historyObj.old_value = bussiness.bus_ownership;
        historyObj.new_value = req.body.bus_ownership;
        History.create(historyObj, () => {});
      }
    }
    if (emailB.email_add != req.body.email) {
      historyObj.field_name = "Email Address";
      historyObj.old_value = emailB.email_add;
      historyObj.new_value = req.body.email;
      History.create(historyObj, () => {});
    }
    if (phoneB.phone_number != req.body.phone_number) {
      historyObj.field_name = "Mobile";
      historyObj.old_value = phoneB.phone_number;
      historyObj.new_value = req.body.phone_number;
      History.create(historyObj, () => {});
    }

    Individual.updateOne({ _id: req.body.id }, individual).exec(
      (err, result) => {}
    );
    EmailAddress.updateOne({ individual: req.body.id }, emailadd).exec(
      (err, result) => {}
    );
    PhoneBook.updateOne({ individual: req.body.id }, phonebook).exec(
      (err, result) => {}
    );
    Bussiness.updateOne({ individual: req.body.id }, bussinesses).exec(
      (err, result) => {}
    );

    res.json({ message: "success" });
  } else {
    var isExistEmail = await EmailAddress.findOne({
      email_type: "personal",
      email_add: req.body.email,
      code: "RGEM",
    });
    var isExistPhone = await PhoneBook.findOne({
      phone_type: "personal",
      phone_number: req.body.phone_number,
      code: "RGPH",
    });

    if (isExistPhone) {
      res.json({ message: "already phone" });
      return;
    }
    if (isExistEmail) {
      res.json({ message: "already email" });
      return;
    }

    let individual = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      middlename: req.body.middlename,
      status: "pending",
      seller_status: req.body.seller_status,
      registration_source: req.body.registration_source,
      registration_source_other: req.body.registration_source_other,
      role: "user",
      password: passwordHash.generate(req.body.firstname),
      email_address: null,
      phonebook: null,
      deleted: null,
    };

    var Indivi = await Individual.create(individual);

    let emailadd = {
      email_type: "personal",
      email_add: req.body.email,
      status: "active",
      create_user: req.body.create_user,
      individual: Indivi._id,
      code: "RGEM",
    };

    var EmailAdd = await EmailAddress.create(emailadd);

    let phonebook = {
      phone_type: "personal",
      entity_type: "mobile",
      countery_code: "",
      phone_number: req.body.phone_number,
      status: "active",
      create_user: req.body.create_user,
      individual: Indivi._id,
      code: "RGPH",
    };

    var Phbook = await PhoneBook.create(phonebook);

    let bussinesses = {
      bus_name: req.body.bus_name,
      bus_ownership: req.body.bus_ownership != "Artisan" ? "Publicly-owned business" : "Artisan",
      individual: Indivi._id,
      email: req.body.email,
      storename: '',
      brandName: '',
      bus_entity_type: '',
      bus_entity_type_other: '',
      status: 'active',
      phone: req.body.phone_number,
      editedby: '',
      deleted: null,
      deletedby: null,
      create_user: req.body.id,
      bussiness: '',
    };

    var business = await Bussiness.create(bussinesses);

    var business_email = {
      email_type: "business", // (personel,corporate)
      email_add: req.body.email,
      status: "active",
      editedby: "",
      deleted: null,
      deletedby: null,
      bussiness: business._id,
      create_user: req.body.create_user,
      individual: business.individual,
      code: "BSEM",
    };
    //create business Email
    EmailAddress.create(business_email, () => {});

    var business_phone = {
      phone_type: "mobile", //(mobile,landline,fax)
      entity_type: "business", //(main,alternate)
      countery_code: "",
      isd_code: "",
      area_code: "",
      phone_number: req.body.phone_number,
      status: "active",
      deleted: null,
      deletedby: null,
      bussiness: business._id,
      create_user: req.body.create_user,
      individual: business.individual,
      code: "BSPH",
    };
    //create business Phone
    PhoneBook.create(business_phone, () => {});

    User.create({
            "individual": Indivi._id,
            "username": "",
            "password": "",
            "parent_user": req.body.reportto,
            "descreption": "",
            "create_user": req.body.create_user,
            "deleted": null,
        }, ()=>{});

    Individual.updateOne(
      { _id: Indivi._id },
      {
        $set: { email_address: EmailAdd._id, phonebook: Phbook._id },
      }
    ).exec((err, result) => {});

    res.json({ message: "success" });
  }
});

// Assign prospect
router.all("/prospect-assign", async (req, res, next) => {

  console.log("req.bodyreq.body",req.body);

  let count = 0;

  const insert = async () => {
    if (count < req.body.length) {
      USAssignment.create(req.body[count], () => {});
      count += 1;
      insert();
    } else {
      res.json({ message: "success" });
    }
  };
  insert();
});

// Get Login User Role
router.get("/getUserRole/:id", async (req, res, next) => {
  var userrole = await userRole.findOne(
    { userId: req.params.id },
    { _id: true, roleId: true, userId: true }
  );
  var role = await roleModel.findOne({ _id: userrole.roleId });
  res.json({ message: "success", data: role });
});


// get creator media

router.get("/getMediaById/:id", async function (req, res) {
    var media = await MEDIA.find({ individual: req.params.id, $or: [{ Doc_type: 'product' }, { Doc_type: 'sellerstory' }] }).lean();
    var product = await Product.find({ deleted: null }).select('product_name brand_name createdAt').populate('individual', { firstname: 1, lastname: 1 }).populate('parent', { name: 1 }).populate('child', { name: 1 });
    
    for (let i in media) {
        for (let j in product) {
            if (media[i].parent_entity_id == product[j]._id || media[i].product == product[j]._id) {
                media[i].product_name = product[j].product_name;
            }
        }
    }
    res.json({ message: "success", data: media });
});

// get suspe reasons
router.post("/fetch/suspend_reasons", async function (req, res, next) {
  var check = await CodeDomain.findOne({
    code: "SLRACSPNDRESN",
    status: "active",
  });
  var fetch = await CodeDomainValues.find({ deleted: null,status:"active", codedomain: check }).sort({position:1,value:1});
  res.json({ message: "success", data: fetch });
});


module.exports = router;
