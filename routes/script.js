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

const buyer_signup = require("../models/buyer_signup");
const category_seo_tag = require("../models/category_seo_tag");
const comm_history = require("../models/comm_history");
const event = require("../models/event");
const Hsn = require("../models/Hsn");
const login_attempt = require("../models/login_attempt");
const marketplace_country_product = require("../models/marketplace_country_product");
const notes = require("../models/notes");
const otp = require("../models/otp");
const otp_attempt = require("../models/otp_attempt");
const product_cat_seo_tag = require("../models/product_cat_seo_tag");
const sellerstory = require("../models/sellerstory");
const seo_tag = require("../models/seo_tag");
const subscriptionplan = require("../models/subscriptionplan");
const tax = require("../models/tax");
const user_session = require("../models/user_session");
const service_role = require("../models/service_role");


router.post("/executescript", async function (req, res, next) {

    // Address -----
    // Bank ------
    BusMarketPlacecountry.deleteMany({}).exec((err, result) => {});
    Bussiness_Individual.deleteMany({}).exec((err, result) => {});
    ProCapacity.deleteMany({}).exec((err, result) => {});
    ProCategory.deleteMany({}).exec((err, result) => {});
    // Business -----
    // buyer_signup -----
    // category ----
    category_seo_tag.deleteMany({}).exec((err, result) => {});
    // code domain ----
    // code domain values -----
    // communucation composition -----
    comm_history.deleteMany({}).exec((err, result) => {});
    // EmailAddress ---------
    // email sms configuration -----
    event.deleteMany({}).exec((err, result) => {});
    History.deleteMany({}).exec((err, result) => {});
    Hsn.deleteMany({}).exec((err, result) => {});
    // individual -------
    login_attempt.deleteMany({}).exec((err, result) => {});
    // MarketPlace ------
    // marketplace_country -----;
    marketplace_country_product.deleteMany({}).exec((err, result) => {});
    //mdl_comm_template ---------
    //mdl_service -----------
    MEDIA.deleteMany({}).exec((err, result) => {});
    notes.deleteMany({}).exec((err, result) => {});
    otp.deleteMany({}).exec((err, result) => {});
    otp_attempt.deleteMany({}).exec((err, result) => {});
    // PhoneBook ------------------
    Product.deleteMany({}).exec((err, result) => {});
    product_cat_seo_tag.deleteMany({}).exec((err, result) => {});
    //related_domain -----
    //roles -----
    sellerstory.deleteMany({}).exec((err, result) => {});
    seo_tag.deleteMany({}).exec((err, result) => {});
    //service_code_domain_value --------
    //service_role ----------
    subscriptionplan.deleteMany({}).exec((err, result) => {});
    TargatIndustry.deleteMany({}).exec((err, result) => {});
    // tax ------
    //temp_individual 
    //temp_Product
    // URL
    //user ------
    //user_role -------
    USAssignment.deleteMany({}).exec((err, result) => {});
    user_session.deleteMany({}).exec((err, result) => {});

    // Rishky Delete
    userRole.deleteMany({roleId: { $nin: ['60ffc0b7d0f994450d0dae75','60fa737d68e92fe2516b2286'] }}).exec((err, result) => {});
    individual.deleteMany({_id: { $nin: ['60fa51c06f863c24b860bda8','61287aa3e10d88d47a9d8c70'] }}).exec((err, result) => {});
    User.deleteMany({individual: { $nin: ['60fa51c06f863c24b860bda8','61287aa3e10d88d47a9d8c70'] }}).exec((err, result) => {});
    PhoneBook.deleteMany({individual: { $nin: ['60fa51c06f863c24b860bda8','61287aa3e10d88d47a9d8c70'] }}).exec((err, result) => {});
    EmailAddress.deleteMany({individual: { $nin: ['60fa51c06f863c24b860bda8','61287aa3e10d88d47a9d8c70'] }}).exec((err, result) => {});
    Address.deleteMany({individual: { $nin: ['60fa51c06f863c24b860bda8','61287aa3e10d88d47a9d8c70'] }}).exec((err, result) => {});
    Bank.deleteMany({individual: { $nin: ['60fa51c06f863c24b860bda8','61287aa3e10d88d47a9d8c70'] }}).exec((err, result) => {});
    Bussiness.deleteMany({individual: { $nin: ['60fa51c06f863c24b860bda8','61287aa3e10d88d47a9d8c70'] }}).exec((err, result) => {});
    URL.deleteMany({individual: { $nin: ['60fa51c06f863c24b860bda8','61287aa3e10d88d47a9d8c70'] }}).exec((err, result) => {});

    res.json({ message: "success"});
   
});

module.exports = router;