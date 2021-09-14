const express = require("express");
const passwordHash = require("password-hash");
const router = express.Router();
const Individual = require("../models/individual");
const URL = require("../models/url");
const MEDIA = require("../models/media");
const Bussiness_Individual = require("../models/business_individual");
const Bussiness = require("../models/bussiness");
const Email_Address = require("../models/email_address");
const PhoneBook = require("../models/phone_book");
const Address = require("../models/address");
const globalService = require('./global_service');
const e = require("express");

router.post("/create", async function (req, res, next) {
    const ur = await Bussiness.create(req.body);

    Address.create({
        country: req.body.address.country,
        state: req.body.address.state,
        city: req.body.address.city,
        code: req.body.address.code,
        individual: req.body.individual,
        status: 'active'
    },()=>{});

    res.json({ message: "success", data: ur });
});

router.post("/bussinessForm", async function (req, res, next) {
    // simple business area
    var business = req.body.business;
    var bus_ind = req.body.bus_ind;

    var business_email = {
        email_type: 'business', // (personel,corporate)
        email_add: req.body.business.email,
        status: 'active',
        editedby: '',
        deleted: null,
        deletedby: null,
        bussiness: req.body.business.bussiness,
        create_user: req.body.business.individual,
        individual: req.body.business.individual,
        code: 'BSEM'
    }

    //create business Email
    Email_Address.create(business_email,()=>{});

    var telephone = {
        phone_type: 'landline', //(mobile,landline,fax)
        entity_type: 'business', //(main,alternate)
        countery_code: '',
        isd_code: '',
        area_code: '',
        phone_number: req.body.telephone.phone_number,
        status: 'active',
        deleted: null,
        deletedby: null,
        bussiness: req.body.business.bussiness,
        create_user: req.body.business.individual,
        individual: req.body.business.individual,
        code: req.body.telephone.code,
    }
    //create telephone  Phone
    PhoneBook.create(telephone,()=>{});

    var business_phone = {
        phone_type: 'mobile', //(mobile,landline,fax)
        entity_type: 'business', //(main,alternate)
        countery_code: '',
        isd_code: '',
        area_code: '',
        phone_number: req.body.business.phone,
        status: 'active',
        deleted: null,
        deletedby: null,
        bussiness: req.body.business.bussiness,
        create_user: req.body.business.individual,
        individual: req.body.business.individual,
        code: 'BSPH'
    }
    //create business Phone
    PhoneBook.create(business_phone,()=>{});

    var busInd = await Bussiness_Individual.create(bus_ind);

    var business_email = {
        email_type: 'business_ind', // (personel,corporate)
        email_add: bus_ind.email,
        status: 'active',
        editedby: '',
        deleted: null,
        deletedby: null,
        bussiness_individual: busInd._id,
        create_user: bus_ind.individual,
        individual: bus_ind.individual,
        code: 'BSIEM'
    }
    //create business Email
    Email_Address.create(business_email,()=>{});


    var business_phone = {
        phone_type: 'business_ind', //(mobile,landline,fax)
        entity_type: 'business', //(main,alternate)
        countery_code: '',
        isd_code: '',
        area_code: '',
        phone_number: bus_ind.phone,
        status: 'active',
        deleted: null,
        deletedby: null,
        bussiness_individual: busInd._id,
        create_user: bus_ind.individual,
        individual: bus_ind.individual,
        code: 'BSIPH'
    }
    //create business Phone
    PhoneBook.create(business_phone,()=>{});

    // Create Addresses
    var address_Register = req.body.address_Register;
    var address_Correspondence = req.body.address_Correspondence;

    Address.create(address_Register,()=>{});

    // create addressRegister
    if (req.body.address_Correspondence.sameasAbove == true) {
        address_Register.address_type = 'Correspondence';
        address_Register.code = 'CRSAD';
        address_Register.sameasAbove= req.body.address_Correspondence.sameasAbove;
        Address.create(address_Register,()=>{});
    } else {
        Address.create(address_Correspondence,()=>{});
    }

    // update business because date is change
    Bussiness.updateOne({
        individual: req.body.business.individual,
    }, {
        $set: {
            storename: req.body.business.storename,
            brandName: req.body.business.brandName,
            bus_name: req.body.business.bus_name,
            bus_entity_type: req.body.business.bus_entity_type,
            bus_entity_type_other: req.body.business.bus_entity_type_other,
        },
    }).exec((err, result) => {});

    // website url
    var url = req.body.url;
    if (url.url != '') {
        URL.create(url,()=>{});
    }

    // Create Media

    var media_KycDocuments_incorporation = req.body.media.KycDocuments.incorporation;
    var media_KycDocuments_APV = req.body.media.KycDocuments.Addr_Proof_validation;
    var media_KycDocuments_IEC = req.body.media.KycDocuments.IEC;
    var media_KycDocuments_AadharCard = req.body.media.KycDocuments.AadharCard;

    if (media_KycDocuments_incorporation.url != '') {
        MEDIA.create(media_KycDocuments_incorporation,()=>{});
    }
    if (media_KycDocuments_APV.url != '') {
        MEDIA.create(media_KycDocuments_APV,()=>{});
    }
    if (media_KycDocuments_IEC.url != '') {
        MEDIA.create(media_KycDocuments_IEC,()=>{});
    }
    if (media_KycDocuments_AadharCard.url != '') {
        MEDIA.create(media_KycDocuments_AadharCard,()=>{});
    }

    var media_TradeMembership = req.body.media.TradeMembership;

    for (let i = 0; i < media_TradeMembership.length; i++) {
        if (media_TradeMembership[i].url != '' || media_TradeMembership[i].description != '' || media_TradeMembership[i].document_id) {
            MEDIA.create(media_TradeMembership[i],()=>{});
        }
    }

    res.json({ message: "success" });
});

router.post("/individualbussinessForm", async function (req, res, next) {
    var dob = req.body.dobData;
    var ind_id = req.body.ind_id;
    var ProofOfAddress = req.body.media.ProofOfAddress;

    var arrtradebody = req.body.arrtradebody;

    var media_ProofOfIdentity_aadharnumber = req.body.media.ProofOfIdentity.AadharNumber;
    var media_ProofOfIdentity_pannumber = req.body.media.ProofOfIdentity.panNumber;
    var media_ProofOfIdentity_passportnumber = req.body.media.ProofOfIdentity.PassportNumber;

    var media_ProofOfArtisan_UdyogAdharNo = req.body.media.ProofOfArtisan.UdyogAdharNo;
    var media_ProofOfArtisany_ArtisanCardNo = req.body.media.ProofOfArtisan.ArtisanCardNo;

    var media_TradeMembership_type1 = req.body.media.TradeMembership.type1;
    var media_TradeMembership_type2 = req.body.media.TradeMembership.type2;
    var media_TradeMembership_type3 = req.body.media.TradeMembership.type3;

    Individual.updateOne({
        _id: ind_id,
    }, {
        $set: dob,
    }).exec((err, result) => {});

    Address.create(ProofOfAddress,()=>{});

    if (media_ProofOfIdentity_aadharnumber.url != '') {
        MEDIA.create(media_ProofOfIdentity_aadharnumber,()=>{});
    }
    if (media_ProofOfIdentity_pannumber.url != '') {
        MEDIA.create(media_ProofOfIdentity_pannumber,()=>{});
    }
    if (media_ProofOfIdentity_passportnumber.url != '') {
        MEDIA.create(media_ProofOfIdentity_passportnumber,()=>{});
    }
    if (media_ProofOfArtisan_UdyogAdharNo.url != '') {
        MEDIA.create(media_ProofOfArtisan_UdyogAdharNo,()=>{});
    }
    if (media_ProofOfArtisany_ArtisanCardNo.url != '') {
        MEDIA.create(media_ProofOfArtisany_ArtisanCardNo,()=>{});
    }
    arrtradebody.forEach(element => {
        if (element.url != '') {
            MEDIA.create(element,()=>{});
        }
    });

    res.json({ message: "success" });
});


router.post("/artisaninfoForm", async function (req, res, next) {

    var storename = req.body.storename;
    var craft_name = req.body.craft_name;
    var craft_desc = req.body.craft_desc;
    var arrcraftphoto = req.body.arrcraftphoto;
    var arrcraftvideo = req.body.arrcraftvideo;
    var arrmanufacturingvideo = req.body.arrmanufacturingvideo;

    var ind_id = req.body.ind_id;

    var profilephto = req.body.media.artisian.profilephoto;
    var logo = req.body.media.artisian.logo;
    var biography = req.body.media.artisian.biography;
    var manufacturing = req.body.media.artisian.manufacturing;
    var craftphoto = req.body.media.artisian.craftphoto;
    var craftvideo = req.body.media.artisian.craftvideo;
    var ManfacProcessVideo = req.body.media.artisian.ManfacProcessVideo;
    var selfintroductionvideo = req.body.media.artisian.selfintroductionvideo;


    Bussiness.updateOne({
        individual: ind_id,
    }, {
        $set: { "storename": storename, "craft_name": craft_name, "craft_desc": craft_desc },
    }).exec((err, result) => {});

    arrcraftphoto.forEach(element => {
        if (element.url != '') {
            MEDIA.create(element,()=>{});
        }
    });

    arrcraftvideo.forEach(element => {
        if (element.url != '') {
            MEDIA.create(element,()=>{});
        }
    });

    arrmanufacturingvideo.forEach(element => {
        if (element.url != '') {
            MEDIA.create(element,()=>{});
        }
    });

    if (profilephto.url != '') {
        MEDIA.create(profilephto,()=>{});
    }
    if (logo.url != '') {
        MEDIA.create(logo,()=>{});
    }
    if (biography.url != '') {
        MEDIA.create(biography,()=>{});
    }
    if (manufacturing.url != '') {
        MEDIA.create(manufacturing,()=>{});
    }
    if (craftphoto.url != '') {
        MEDIA.create(craftphoto,()=>{});
    }
    if (craftvideo.url != '') {
        MEDIA.create(craftvideo,()=>{});
    }
    if (ManfacProcessVideo.url != '') {
        MEDIA.create(ManfacProcessVideo,()=>{});
    }
    if (selfintroductionvideo.url != '') {
        MEDIA.create(selfintroductionvideo,()=>{});
    }

    res.json({ message: "success" });
});

router.get("/:id", async function (req, res, next) {
    var ur = await Bussiness.findOne({ _id: req.params.id });
    res.json({ message: "success", data: ur });
});

router.post("/BussinessIndividual", async function (req, res, next) {
    var phone = {
        phone_type: 'mobile', //(mobile,landline,fax)
        entity_type: 'alternate', //(main,alternate)
        countery_code: '',
        isd_code: '',
        area_code: '',
        phone_number: req.body.mobile,
        status: 'active',
        deleted: null,
        deletedby: null,
        bussiness: null,
        create_user: req.body.individual,
        individual: req.body.individual,
        code: 'BSIPH2'
    };
    
    PhoneBook.create(phone,()=>{});

    var email = {
        email_type: 'alternate', // (personel,corporate)
        email_add: req.body.email,
        status: 'active',
        editedby: null,
        deleted: null,
        bussiness: null,
        create_user: req.body.individual,
        individual: req.body.individual,
        code: 'BSIEM2'
    };

    Email_Address.create(email,()=>{});
    Bussiness_Individual.updateOne({
        individual: req.body.individual,
    }, {
        $set: {
            job_title: req.body.job_title,
            job_function: req.body.job_function,
            department: req.body.department
        },
    }).exec((err, result) => {});
    
    Individual.updateOne({
        _id: req.body.individual,
    }, {
        $set: {
            salutation: req.body.salutation
        },
    }).exec((err, result) => {});

    res.json({ message: "success" });
});

router.post("/CreateTax", async function (req, res, next) {
    var first = req.body.first;
    var second = req.body.second;

    MEDIA.create(second,()=>{});

    if(req.body.three.gst_updt_type == 'provided'){
        MEDIA.create(first,()=>{});
    }
    
    Bussiness.updateOne({
        individual: req.body.individual,
    }, {
        $set: {
            gst_updt_type: req.body.three.gst_updt_type,
        },
    }).exec((err, result) => {});

    let body = {
        userId: req.body.individual,
    }

    globalService.emailTemplateSend("Seller Registration", body, (eventTemplate)=> {});

    res.json({ message: "success" });
});

router.post("/skiptoLogin", async function (req, res, next) {
    var business = await Bussiness.create(req.body);
    Address.create(req.body.address,()=>{});

    var businessEmail = await Email_Address.findOne({ individual: req.body.individual, email_type: 'personal', code: 'RGEM' });
    var businessPhone = await PhoneBook.findOne({ individual: req.body.individual, phone_type: 'personal', code: 'RGPH' });

    
    var business_email = {
        email_type: 'business', // (personel,corporate)
        email_add: businessEmail.email_add,
        status: 'active',
        editedby: '',
        deleted: null,
        deletedby: null,
        bussiness: business._id,
        create_user: req.body.individual,
        individual: req.body.individual,
        code: 'BSEM'
    }
    //create business Email
    Email_Address.create(business_email,()=>{});

    var telephone = {
        phone_type: 'landline', //(mobile,landline,fax)
        entity_type: 'business', //(main,alternate)
        countery_code: '',
        isd_code: '',
        area_code: '',
        phone_number: '',
        status: 'active',
        deleted: null,
        deletedby: null,
        bussiness: business._id,
        create_user: req.body.individual,
        individual: req.body.individual,
        code: 'BLTEP',
    }
    //create telephone  Phone
    PhoneBook.create(telephone,()=>{});
    var business_phone = {
        phone_type: 'mobile', //(mobile,landline,fax)
        entity_type: 'business', //(main,alternate)
        countery_code: '',
        isd_code: '',
        area_code: '',
        phone_number: businessPhone.phone_number,
        status: 'active',
        deleted: null,
        deletedby: null,
        bussiness: business._id,
        create_user: req.body.individual,
        individual: req.body.individual,
        code: 'BSPH'
    }
    //create business Phone
    PhoneBook.create(business_phone,()=>{});
    var busInd = await Bussiness_Individual.create({
        status: 'active',
        username: '',
        phone: '',
        email: '',
        editedby: '',
        deleted: null,
        deletedby: null,
        bussiness: business._id,
        create_user: req.body.individual,
        individual: req.body.individual,
    });
    var business_email = {
        email_type: 'business_ind', // (personel,corporate)
        email_add: '',
        status: 'active',
        editedby: '',
        deleted: null,
        deletedby: null,
        bussiness_individual: busInd._id,
        create_user: req.body.individual,
        individual: req.body.individual,
        code: 'BSIEM'
    }
    //create business Email
    Email_Address.create(business_email,()=>{});
    var business_phone = {
        phone_type: 'business_ind', //(mobile,landline,fax)
        entity_type: 'business', //(main,alternate)
        countery_code: '',
        isd_code: '',
        area_code: '',
        phone_number: '',
        status: 'active',
        deleted: null,
        deletedby: null,
        bussiness_individual: busInd._id,
        create_user: req.body.individual,
        individual: req.body.individual,
        code: 'BSIPH'
    }
    //create business Phone
    PhoneBook.create(business_phone,()=>{});
    //create URL
    URL.create({
        url: '',
        bussiness: business._id,
        status: 'active',
        url_type: 'companywebsite',
        create_user: req.body.individual,
        individual: req.body.individual,
        deleted: '',
        deletedby: null,
    },()=>{});

    var phone = {
        phone_type: 'mobile', //(mobile,landline,fax)
        entity_type: 'alternate', //(main,alternate)
        countery_code: '',
        isd_code: '',
        area_code: '',
        phone_number: '',
        status: 'active',
        deleted: null,
        deletedby: null,
        bussiness: null,
        create_user: req.body.individual,
        individual: req.body.individual,
        code: 'BSIPH2'
    };
    PhoneBook.create(phone,()=>{});
    var email = {
        email_type: 'alternate', // (personel,corporate)
        email_add: req.body.email,
        status: 'active',
        editedby: null,
        deleted: null,
        bussiness: null,
        create_user: req.body.individual,
        individual: req.body.individual,
        code: 'BSIEM2'
    };
    Email_Address.create(email,()=>{});
    
    res.json({ message: "success" });
});


module.exports = router;