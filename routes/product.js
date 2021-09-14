const express = require("express");
const router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
const csvtojsonV2=require("csvtojson");
const Product = require("../models/product");
const Temp_Product = require("../models/temp_Product");
const Media = require("../models/media");
const CodeDomainValues = require("../models/code_domainValues");
const History = require("../models/history");
const Category = require("../models/category");
const Seotag = require("../models/seo_tag");
const categorySeo = require("../models/category_seo_tag");
const productCatSeo = require("../models/product_cat_seo_tag");
const CodeDomain = require("../models/code_domain");
const temp_Product = require("../models/temp_Product");
const Bussiness = require("../models/bussiness");
const roleModel = require('../models/role');
const userRole = require('../models/user_role');
const RelatedCodeDomain = require("../models/related_domain");
const globalService = require('./global_service');
const USAssignment = require("../models/user_service_assignment");
const User = require("../models/user");


router.get("/getAll", async function (req, res, next) {
    var fetch = await Product.find({ deleted: null }).select('product_name brand_name createdAt').populate('individual', { firstname: 1, lastname: 1 }).populate('parent', { name: 1 }).populate('child', { name: 1 }).sort({ createdAt: -1 });
    res.json({ message: "success", data: fetch });
});

router.post("/getAllBySeller/:id", async function(req, res, next) {

    var userrole = await userRole.findOne({ userId: req.params.id });
    var rolem = await roleModel.findOne({ _id: userrole.roleId });

    if (rolem.name == 'Super Admin') {
        var fetch = await Product.find({ deleted: null, $or: [{ individual: req.params.id },{product_status: "MERPLREW"}] }).populate('individual market_type length_type weight_type packaging_type visibility_type categories').lean().sort({ createdAt: -1 });
    
        let status = [];
        for (let i in fetch) {
            status.push(fetch[i].product_status);
        }

        var mrkTyp = await CodeDomain.findOne({ code: 'PROWRKFLST' });
        var cdv = await CodeDomainValues.find({ deleted: null, codedomain: mrkTyp, code: {$in: status} }).sort({position:1,value:1}).lean();

         for (let i in fetch) {
            for (let k in cdv) {
             if (cdv[k].code == fetch[i].product_status) {
                 fetch[i].productStatus = cdv[k].value;
             }
         }
        }

        res.json({ message: "success", data: fetch });

    } else {

        globalService.getByPageWFS(req, async (keyList) => {
            if (req.body.route) {
                var fetch = await Product.find({ deleted: null, individual: req.params.id, product_status: {$in: keyList} }).populate('individual market_type length_type weight_type packaging_type visibility_type categories').lean().sort({ createdAt: -1 });
            } else {
                var fetch = await Product.find({ deleted: null, individual: req.params.id }).populate('individual market_type length_type weight_type packaging_type visibility_type categories').lean().sort({ createdAt: -1 });
            }
        
            let status = [];
            for (let i in fetch) {
                status.push(fetch[i].product_status);
            }

            var mrkTyp = await CodeDomain.findOne({ code: 'PROWRKFLST' });
            var cdv = await CodeDomainValues.find({ deleted: null, codedomain: mrkTyp, code: {$in: status} }).sort({position:1,value:1}).lean();

            let idss = [];
            for (let i in cdv) {
                idss.push(cdv[i]._id);
            }

            var fetch1 = await RelatedCodeDomain.find({ deleted: null,codedomain_values1:{$in: idss}});

            for (let i in cdv) {
                for (let k in fetch1) {
                    if (''+fetch1[k].codedomain_values1 == ''+cdv[i]._id) {
                        cdv[i].tmpId = fetch1[k].codedomain_values2;
                    }
                }
            }

            let fIds = [];
            for (let i in fetch1) {
                fIds.push(fetch1[i].codedomain_values2);
            }

            var finalData = await CodeDomainValues.find({ deleted: null, _id: {$in: fIds} }).sort({position:1,value:1});

            for (let i in finalData) {
                for (let k in cdv) {
                    if(cdv[k].tmpId == ''+finalData[i]._id) {
                        cdv[k].value = finalData[i].value;
                    }
                }
            }

            for (let i in fetch) {
                for (let k in cdv) {
             
                 if (cdv[k].code == fetch[i].product_status) {
                     fetch[i].productStatus = cdv[k].value;
                 }
             }
            }

            res.json({ message: "success", data: fetch });
        });
    }

});

// // Status Wise Get All Product
// router.post("/getProductByStatus", async function(req, res, next) {
//     var userrole = await userRole.findOne({ userId: req.body.individualId });
//     var rolem = await roleModel.findOne({ _id: userrole.roleId });

//     if (rolem.name == 'Super Admin') {
//         var fetch = await Product.find({ deleted: null, product_status: req.body.product_status }).populate('individual market_type length_type weight_type packaging_type visibility_type categories').lean();
//         var realStatus = await CodeDomainValues.findOne({ code: req.body.product_status });
        
//         if(realStatus && realStatus._id){
//             for (let i in fetch) {
//                 fetch[i].productStatus = realStatus.value;
//             }
//         }

//         // var fetch = await Product.find({ deleted: null, individual: req.body.individualId, product_status: "Approve For Listing" }).populate('individual market_type length_type weight_type packaging_type visibility_type categories').lean();
//         res.json({ message: "success", data: fetch });
//     } else {
//         globalService.getByPageWFS(req, async (keyList) => {
//             var fetch = await Product.find({ deleted: null, individual: req.body.individualId, product_status: {$in: keyList} }).populate('individual market_type length_type weight_type packaging_type visibility_type categories').lean();
//             var realStatus = await CodeDomainValues.findOne({ code: req.body.product_status });

//             if(realStatus && realStatus._id){
//                 for (let i in fetch) {
//                     fetch[i].productStatus = realStatus.value;
//                 }
//             }

//             // var fetch = await Product.find({ deleted: null, individual: req.body.individualId, product_status: "Approve For Listing" }).populate('individual market_type length_type weight_type packaging_type visibility_type categories').lean();
//             res.json({ message: "success", data: fetch });
//         });
//     }
// });

// Status Wise Get All Product
router.post("/getProductByStatus", async function(req, res, next) {

    
    var userrole = await userRole.findOne({ userId: req.body.individualId });
    var rolem = await roleModel.findOne({ _id: userrole.roleId });

    if (rolem.name == 'Super Admin' || rolem.name == 'Admin') {
        globalService.getByPageWFS(req, async (keyList) => {
            var fetch = await Product.find({ deleted: null, product_status: {$in: keyList} }).populate('individual market_type length_type weight_type packaging_type visibility_type categories').lean().sort({ createdAt: -1 });
            var realStatus = await CodeDomainValues.findOne({ code: req.body.product_status });
            
            if(realStatus && realStatus._id){
                for (let i in fetch) {
                    fetch[i].productStatus = realStatus.value;
                }
            }
            res.json({ message: "success", data: fetch });
        });
    } else {
        if(req.body.showunassignproduct) {
            globalService.getByPageWFS(req, async (keyList) => {
                var fetch = await Product.find({ deleted: null, product_status: {$in: keyList} }).populate('individual market_type length_type weight_type packaging_type visibility_type categories').sort({ createdAt: -1 }).lean();
                // var fetch = await Product.find({ deleted: null, individual: req.body.individualId, product_status: {$in: keyList} }).populate('individual market_type length_type weight_type packaging_type visibility_type categories').lean().sort({ createdAt: -1 });
                var realStatus = await CodeDomainValues.findOne({ code: req.body.product_status });

                if(realStatus && realStatus._id){
                    for (let i in fetch) {
                        fetch[i].productStatus = realStatus.value;
                    }
                }

                // var fetch = await Product.find({ deleted: null, individual: req.body.individualId, product_status: "Approve For Listing" }).populate('individual market_type length_type weight_type packaging_type visibility_type categories').lean();
                res.json({ message: "success", data: fetch });
            });
        } else {
            globalService.getByPageWFS(req, async (keyList) => {
                let ii = [];

                let srvassignList = await USAssignment.find(
                    { deleted: null , assing_user_id : req.body.individualId,parent_entity_name:"Product"}
                );

                for (let i in srvassignList) {
                  ii.push(srvassignList[i].parent_entity_id);
                }
                var createdmy = await User.find({
                      deleted: null,create_user: req.body.individualId 
                });

                var fetch = await Product.find({ deleted: null,_id: { $in: ii }, product_status: {$in: keyList} }).populate('individual market_type length_type weight_type packaging_type visibility_type categories').lean().sort({ createdAt: -1 });
                

                var realStatus = await CodeDomainValues.findOne({ code: req.body.product_status });

                if(realStatus && realStatus._id){
                    for (let i in fetch) {
                        fetch[i].productStatus = realStatus.value;
                    }
                }

                // var fetch = await Product.find({ deleted: null, individual: req.body.individualId, product_status: "Approve For Listing" }).populate('individual market_type length_type weight_type packaging_type visibility_type categories').lean();
                res.json({ message: "success", data: fetch });
            });
        }
    }
});

router.post("/create", async function(req, res, next) {
    var Cr = await Product.create(req.body);

    for (let i = 0; i < req.body.images.length; i++) {
        var Obj = {
            Doc_type: 'product',
            file_type: 'image',
            url: req.body.images[i].url,
            product: Cr._id,
            individual: req.body.individual
        }
        Media.create(Obj,()=>{});
    }

    for (let i = 0; i < req.body.video.length; i++) {
        var Obj = {
            Doc_type: 'product',
            file_type: 'video',
            url: req.body.video[i].url,
            product: Cr._id,
            individual: req.body.individual
        }
        Media.create(Obj,()=>{});
    }

    res.json({ message: "success", data: Cr });
});

// create temporary Product
router.post("/temp/create", async function(req, res, next) {

    // declare veriable
    var mrk_check = false;
    var visib_check = false;
    var color_check = false;
    var lengthType_check = false;
    var weightType_check = false;
    var packaging_check = false;

    for (let j = 0; j < req.body.length; j++) {

        mrk_check = false;
        visib_check = false;
        color_check = false;
        lengthType_check = false;
        weightType_check = false;
        packaging_check = false;

        var mrkTyp = await CodeDomain.findOne({ code: 'MKTTYP' });
        var mrk = await CodeDomainValues.find({ deleted: null, codedomain: mrkTyp._id }).sort({position:1,value:1});

        for (let i = 0; i < mrk.length; i++) {
            if (mrk[i].value.toString().toLowerCase() == req.body[j].market_type.toString().toLowerCase()) {
                req.body[j].market_type = mrk[i]._id;
            } else {
                mrk_check = true;
            }
        }
        if (mrk_check) {
            var Obj = {
                value: req.body[j].market_type,
                code: req.body[j].market_type,
                status: 'active',
                deleted: null,
                deletedby: null,
                codedomain: mrkTyp._id,
            }
            var mrk_cr = await CodeDomainValues.create(Obj);
            req.body[j].market_type = mrk_cr._id;
        }


        // check visibility Type
        var visibTyp = await CodeDomain.findOne({ code: 'VSB' });
        var visib = await CodeDomainValues.find({ deleted: null, codedomain: visibTyp._id }).sort({position:1,value:1})

        for (let i = 0; i < visib.length; i++) {
            if (visib[i].value.toString().toLowerCase() == req.body[j].visibility_type.toString().toLowerCase()) {
                req.body[j].visibility_type = visib[i]._id;
                visib_check = false;
            } else {
                visib_check = true;
            }
        }
        if (visib_check) {
            var Obj1 = {
                value: req.body[j].visibility_type,
                code: req.body[j].visibility_type,
                status: 'active',
                deleted: null,
                deletedby: null,
                codedomain: visibTyp._id,
            }
            var visib_cr = await CodeDomainValues.create(Obj1);
            req.body[j].visibility_type = visib_cr._id;
        }


        // check Color Value
        var colorTyp = await CodeDomain.findOne({ code: 'CLRPLT' });
        var colr = await CodeDomainValues.find({ deleted: null, codedomain: colorTyp._id }).sort({position:1,value:1})

        for (let i = 0; i < colr.length; i++) {
            if (colr[i].value.toString().toLowerCase() == req.body[j].color_value.toString().toLowerCase()) {
                req.body[j].color_value = colr[i]._id;
                color_check = false;
            } else {
                color_check = true;
            }
        }
        if (color_check) {
            var Obj3 = {
                value: req.body[j].color_value,
                code: req.body[j].color_value,
                status: 'active',
                deleted: null,
                deletedby: null,
                codedomain: colorTyp._id,
            }
            var color_cr = await CodeDomainValues.create(Obj3);
            req.body[j].color_value = color_cr._id;
        }

        // check Length Type
        var lengTyp = await CodeDomain.findOne({ code: 'ULGM' });
        var lengths = await CodeDomainValues.find({ deleted: null, codedomain: lengTyp._id }).sort({position:1,value:1})

        for (let i = 0; i < lengths.length; i++) {
            if (lengths[i].value.toString().toLowerCase() == req.body[j].length_type.toString().toLowerCase()) {
                req.body[j].length_type = lengths[i]._id;
                lengthType_check = false;
            } else {
                lengthType_check = true;
            }
        }
        if (lengthType_check) {
            var Obj3 = {
                value: req.body[j].length_type,
                code: req.body[j].length_type,
                status: 'active',
                deleted: null,
                deletedby: null,
                codedomain: lengTyp._id,
            }
            var leng_cr1 = await CodeDomainValues.create(Obj3);
            req.body[j].length_type = leng_cr1._id;
        }


        // check Weight Type
        var weigTyp = await CodeDomain.findOne({ code: 'UWGM' });
        var weig = await CodeDomainValues.find({ deleted: null, codedomain: weigTyp._id }).sort({position:1,value:1})

        for (let i = 0; i < weig.length; i++) {
            if (weig[i].value.toString().toLowerCase() == req.body[j].weight_type.toString().toLowerCase()) {
                req.body[j].weight_type = weig[i]._id;
                weightType_check = false;
            } else {
                weightType_check = true;
            }
        }
        if (weightType_check) {
            var Obj3 = {
                value: req.body[j].weight_type,
                code: req.body[j].weight_type,
                status: 'active',
                deleted: null,
                deletedby: null,
                codedomain: weigTyp._id,
            }
            var leng_cr1 = await CodeDomainValues.create(Obj3);
            req.body[j].weight_type = leng_cr1._id;
        }


        // check Weight Type
        var packageTyp = await CodeDomain.findOne({ code: 'PKTYP' });
        var packages = await CodeDomainValues.find({ deleted: null, codedomain: packageTyp._id }).sort({position:1,value:1})

        for (let i = 0; i < packages.length; i++) {
            if (packages[i].value.toString().toLowerCase() == req.body[j].packaging_type.toString().toLowerCase()) {
                req.body[j].packaging_type = packageTyp._id;
                packaging_check = false;
            } else {
                packaging_check = true;
            }
        }
        if (packaging_check) {
            var Obj6 = {
                value: req.body[j].packaging_type,
                code: req.body[j].packaging_type,
                status: 'active',
                deleted: null,
                deletedby: null,
                codedomain: packageTyp._id,
            }
            var leng_cr1 = await CodeDomainValues.create(Obj6);
            req.body[j].packaging_type = leng_cr1._id;
        }
    }

    Temp_Product.create(req.body, ()=>{});

    res.json({ message: "success" });
});

// get All temp Products
router.get("/temp/getAll/:id", async function(req, res, next) {
    var fetch = await Temp_Product.find({ deleted: 'no', individual: req.params.id }).populate('individual market_type length_type weight_type packaging_type visibility_type').sort({ createdAt: -1 });
    res.json({ message: "success", data: fetch });
});

router.post("/create-product", async function(req, res, next) {
    var Cr = await Product.create(req.body);
    var seo = await Seotag.create(req.body);

    req.body.seo_tag_id = seo._id;

    var catSeo = await categorySeo.create(req.body);
    req.body.category_seo_tag_id = catSeo._id;
    req.body.product_id = Cr._id;
    productCatSeo.create(req.body, ()=>{});


    for(let i in req.body.pantoneImg){
        req.body.pantoneImg[i].parent_entity_id = Cr._id
        Media.create(req.body.pantoneImg[i],()=>{});
    }

    for (let i = 0; i < req.body.images.length; i++) {
        var Obj = {
            Doc_type: 'product',
            file_type: 'image',
            url: req.body.images[i].url,
            product: Cr._id,
            individual: req.body.individual
        }
        Media.create(Obj,()=>{});
    }

    for (let i = 0; i < req.body.video.length; i++) {
        var Obj = {
            Doc_type: 'product',
            file_type: 'video',
            url: req.body.video[i].url,
            product: Cr._id,
            individual: req.body.individual
        }
        Media.create(Obj,()=>{});
    }

    res.json({ message: "success", data: Cr });
});

router.post("/categories", async function(req, res, next) {

    var categSeo = await categorySeo.find({}).sort({ createdAt: -1 });

    let seo_tagId = [];
    for (let i in req.body) {
        for (let j in categSeo) {
            for (let k in categSeo[j].categories) {
                if (categSeo[j].categories[k].category == req.body[j]) {
                    seo_tagId.push(categSeo[j].seo_tag_id);
                }
            }
        }
    }

    var tag = await Seotag.find({ _id: { $in: seo_tagId } }).sort({ createdAt: -1 });

    const finalTag = [];
    if(tag){   
        for (let i in tag) {
            for (let j in tag[i].tags) {
                const isInArray = finalTag.includes(tag[i].tags[j].value);
                if (!isInArray) {
                    finalTag.push(tag[i].tags[j].value);
                }
            }
        } 
    }

    res.json({ message: "success", data: finalTag });
});

router.get("/getBrandName/:id", async function(req, res, next) {
    var bussiness = await Bussiness.findOne({ individual: req.params.id},{brandName : true}).sort({ createdAt: -1 });
    res.json({ message: "success", data: bussiness});
})

// Update status
router.post("/statusUpdate", async function (req, res, next) {
    var pUser = await Product.findOne({ _id: req.body.id });

    Product.updateOne({ _id: req.body.id }, {
        $set: { product_status: req.body.product_status }
    }).exec((err, result) => {});

    // Rajnikant Start Code
    let body = {
        userId: pUser.individual,
    }

    if (req.body.product_status != 'MERPLREW') {
        let emailKey = '';
        if(req.body.product_status == 'ThmeCntRevw') {
            emailKey = "Approve as a Theme";
        }
        if(req.body.product_status == 'SEOREVW') {
            emailKey = "Approve as a SEO";
        }
        if(req.body.product_status == 'QCREVW') {
            emailKey = "Approve as a QC";
        }
        if(req.body.product_status == 'APROVEDPL') {
            emailKey = "Approve as product listing";
        }
        if(req.body.product_status == 'REJTEDPL') {
            emailKey = "Product rejected";
        }

        globalService.emailTemplateSend(emailKey, body, (eventTemplate)=> {
           res.json({ message: "success"});
        });
    } else {
        res.json({ message: "success"});
    }
});

router.get("/:id", async function(req, res, next) {
    var Cr = await Product.findOne({ _id: req.params.id })
        .populate('individual', { firstname: 1, lastname: 1 })
        .populate('market_type', { value: 1 })
        .populate('length_type', { value: 1 })
        .populate('weight_type', { value: 1 })
        .populate('packaging_type', { value: 1 })
        .populate('visibility_type', { value: 1 }).lean();

    var MD = await Media.find({ product: req.params.id });
    var pimg = await Media.find({ parent_entity_id: req.params.id });

    if (pimg && Cr) {
        Cr.pantoneImg = pimg;
    }

    var result = await Category.find({ status: 'active', deleted: null }).lean();
    res.json({ message: "success", data: Cr, media: MD, categories: result });
   
});

router.get("/getCetByParent/:id", async function(req, res, next) {
    var result = await Category.find({ parent : req.params.id, status: 'active', deleted: null });
    res.json({ message: "success", categories: result });
});


router.post("/update", async function(req, res, next) {
    var historyObj = {
        parent_entity_name: '',
        context_entity_name: '',
        field_name: '',
        old_value: '',
        new_value: '',
        history_type: 'edit',
        user_session_id: '',
        status: 'active',
        deleted: null,
        editedby: req.body.editedby,
        individual: null,
        business: null,
        product: req.body.id,
        service: null
    };

    var prid = await productCatSeo.findOne({ product_id: req.body.id });
    var cso = await categorySeo.findOne({ _id: prid.category_seo_tag_id });

    req.body.seo_tag_id = cso.seo_tag_id;
    categorySeo.updateOne({_id: prid.category_seo_tag_id }, req.body, {$set: { $set: req.body }}).exec((err, result) => {});

    Seotag.updateOne({_id: cso.seo_tag_id }, req.body, {$set: { $set: req.body }}).exec((err, result) => {});
    Media.deleteMany({parent_entity_id: req.body.id}).exec((err, result) => {});
    
    for(let i in req.body.pantoneImg){
        req.body.pantoneImg[i].parent_entity_id = req.body.id
        Media.create(req.body.pantoneImg[i],()=>{});
    }

    var getSingleProduct = await Product.findOne({ _id: req.body.id });

    if (getSingleProduct.upc_code && 
        getSingleProduct.upc_code != req.body.upc_code) {
        historyObj.field_name = 'Upc Code';
        historyObj.old_value = getSingleProduct.upc_code;
        historyObj.new_value = req.body.upc_code;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.style_code && 
        getSingleProduct.style_code != req.body.style_code) {
        historyObj.field_name = 'Style Code';
        historyObj.old_value = getSingleProduct.style_code;
        historyObj.new_value = req.body.style_code;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.gst_rate &&
        getSingleProduct.gst_rate != req.body.gst_rate) {
        historyObj.field_name = 'Gst Rate';
        historyObj.old_value = getSingleProduct.gst_rate;
        historyObj.new_value = req.body.gst_rate;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.product_name &&
        getSingleProduct.product_name != req.body.product_name) {
        historyObj.field_name = 'product name';
        historyObj.old_value = getSingleProduct.product_name;
        historyObj.new_value = req.body.product_name;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.brand_name && 
        getSingleProduct.brand_name != req.body.brand_name) {
        historyObj.field_name = 'Brand name';
        historyObj.old_value = getSingleProduct.brand_name;
        historyObj.new_value = req.body.brand_name;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.key_features && 
        getSingleProduct.key_features != req.body.key_features) {
        historyObj.field_name = 'Key features';
        historyObj.old_value = getSingleProduct.key_features;
        historyObj.new_value = req.body.key_features;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.theme_content && 
        getSingleProduct.theme_content != req.body.theme_content) {
        historyObj.field_name = 'Theme Content';
        historyObj.old_value = getSingleProduct.theme_content;
        historyObj.new_value = req.body.theme_content;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.hsn_code && 
        getSingleProduct.hsn_code != req.body.hsn_code) {
        historyObj.field_name = 'HSN Code';
        historyObj.old_value = getSingleProduct.hsn_code;
        historyObj.new_value = req.body.hsn_code;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.color_opetion_available && 
        getSingleProduct.color_opetion_available != req.body.color_opetion_available) {
        historyObj.field_name = 'Other Available Color Options';
        historyObj.old_value = getSingleProduct.color_opetion_available;
        historyObj.new_value = req.body.color_opetion_available;
        History.create(historyObj,()=>{});
    }
    if (getSingleProduct.packaging_type_other && 
        getSingleProduct.packaging_type_other != req.body.packaging_type_other) {
        historyObj.field_name = 'Pack Color Options';
        historyObj.old_value = getSingleProduct.packaging_type_other;
        historyObj.new_value = req.body.packaging_type_other;
        History.create(historyObj,()=>{});
    }
    if (getSingleProduct.items_incld_in_pack && 
        getSingleProduct.items_incld_in_pack != req.body.items_incld_in_pack) {
        historyObj.field_name = 'Item Included in Package';
        historyObj.old_value = getSingleProduct.items_incld_in_pack;
        historyObj.new_value = req.body.items_incld_in_pack;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.product_quantity && 
        getSingleProduct.product_quantity != req.body.product_quantity) {
        historyObj.field_name = 'Product Quantity';
        historyObj.old_value = getSingleProduct.product_quantity;
        historyObj.new_value = req.body.product_quantity;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.product_desc && 
        getSingleProduct.product_desc != req.body.product_desc) {
        historyObj.field_name = 'Product Description';
        historyObj.old_value = getSingleProduct.product_desc;
        historyObj.new_value = req.body.product_desc;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.market_type && 
        getSingleProduct.market_type != req.body.market_type) {
        var domValue_new = await CodeDomainValues.findOne({ _id: req.body.market_type, deleted: null })
        var domValue_old = await CodeDomainValues.findOne({ _id: getSingleProduct.market_type, deleted: null })
        historyObj.field_name = 'Market Type';
        historyObj.old_value = domValue_old.value;
        historyObj.new_value = domValue_new.value;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.color_value && 
        getSingleProduct.color_value != req.body.color_value) {
        historyObj.field_name = 'Color Value';
        historyObj.old_value = getSingleProduct.color_value;
        historyObj.new_value = req.body.color_value;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.hex_color_value && 
        getSingleProduct.hex_color_value != req.body.hex_color_value) {
        historyObj.field_name = 'Hexa Color';
        historyObj.old_value = getSingleProduct.hex_color_value;
        historyObj.new_value = req.body.hex_color_value;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.size_applicable && 
        getSingleProduct.size_applicable != req.body.size_applicable) {
        historyObj.field_name = 'Size Applicable';
        historyObj.old_value = getSingleProduct.size_applicable;
        historyObj.new_value = req.body.size_applicable;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.additional_info && 
        getSingleProduct.additional_info != req.body.additional_info) {
        historyObj.field_name = 'Additional Info';
        historyObj.old_value = getSingleProduct.additional_info;
        historyObj.new_value = req.body.additional_info;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.length_type && 
        getSingleProduct.length_type != req.body.length_type) {
        var domValue_new = await CodeDomainValues.findOne({ _id: req.body.length_type, deleted: null })
        var domValue_old = await CodeDomainValues.findOne({ _id: getSingleProduct.length_type, deleted: null })
        historyObj.field_name = 'Length Type';
        historyObj.old_value = domValue_old.value;
        historyObj.new_value = domValue_new.value;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.weight_type && 
        getSingleProduct.weight_type != req.body.weight_type) {
        var domValue_new = await CodeDomainValues.findOne({ _id: req.body.weight_type, deleted: null })
        var domValue_old = await CodeDomainValues.findOne({ _id: getSingleProduct.weight_type, deleted: null })
        historyObj.field_name = 'Weight Type';
        historyObj.old_value = domValue_old.value;
        historyObj.new_value = domValue_new.value;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.product_length && 
        getSingleProduct.product_length != req.body.product_length) {
        historyObj.field_name = 'Product Length';
        historyObj.old_value = getSingleProduct.product_length;
        historyObj.new_value = req.body.product_length;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.product_breadth && 
        getSingleProduct.product_breadth != req.body.product_breadth) {
        historyObj.field_name = 'Product Breadth';
        historyObj.old_value = getSingleProduct.product_breadth;
        historyObj.new_value = req.body.product_breadth;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.product_diameter && 
        getSingleProduct.product_diameter != req.body.product_diameter) {
        historyObj.field_name = 'Product Diameter';
        historyObj.old_value = getSingleProduct.product_diameter;
        historyObj.new_value = req.body.product_diameter;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.product_height && 
        getSingleProduct.product_height != req.body.product_height) {
        historyObj.field_name = 'Product Height';
        historyObj.old_value = getSingleProduct.product_height;
        historyObj.new_value = req.body.product_height;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.product_weight && 
        getSingleProduct.product_weight != req.body.product_weight) {
        historyObj.field_name = 'Product Weight';
        historyObj.old_value = getSingleProduct.product_weight;
        historyObj.new_value = req.body.product_weight;
        History.create(historyObj,()=>{});
    }


    if (getSingleProduct.packaging_type && 
        getSingleProduct.packaging_type != req.body.packaging_type) {
        var domValue_new = await CodeDomainValues.findOne({ _id: req.body.packaging_type, deleted: null })
        var domValue_old = await CodeDomainValues.findOne({ _id: getSingleProduct.packaging_type, deleted: null })
        historyObj.field_name = 'Packaging Type';
        historyObj.old_value = domValue_old.value;
        historyObj.new_value = domValue_new.value;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.package_length && 
        getSingleProduct.package_length != req.body.package_length) {
        historyObj.field_name = 'Package Length';
        historyObj.old_value = getSingleProduct.package_length;
        historyObj.new_value = req.body.package_length;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.package_breadth && 
        getSingleProduct.package_breadth != req.body.package_breadth) {
        historyObj.field_name = 'Package Breadth';
        historyObj.old_value = getSingleProduct.package_breadth;
        historyObj.new_value = req.body.package_breadth;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.package_height && 
        getSingleProduct.package_height != req.body.package_height) {
        historyObj.field_name = 'Package Height';
        historyObj.old_value = getSingleProduct.package_height;
        historyObj.new_value = req.body.package_height;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.package_weight &&
        getSingleProduct.package_weight != req.body.package_weight) {
        historyObj.field_name = 'Package Weight';
        historyObj.old_value = getSingleProduct.package_weight;
        historyObj.new_value = req.body.package_weight;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.package_diameter && 
        getSingleProduct.package_diameter != req.body.package_diameter) {
        historyObj.field_name = 'Package Diameter';
        historyObj.old_value = getSingleProduct.package_diameter;
        historyObj.new_value = req.body.package_diameter;
        History.create(historyObj,()=>{});
    }


    if (getSingleProduct.visibility_type && 
        getSingleProduct.visibility_type != req.body.visibility_type) {
        var domValue_new = await CodeDomainValues.findOne({ _id: req.body.visibility_type, deleted: null })
        var domValue_old = await CodeDomainValues.findOne({ _id: getSingleProduct.visibility_type, deleted: null })
        historyObj.field_name = 'Visibility Type';
        historyObj.old_value = domValue_old.value;
        historyObj.new_value = domValue_new.value;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.status && 
        getSingleProduct.status != req.body.status) {
        historyObj.field_name = 'Status';
        historyObj.old_value = getSingleProduct.status;
        historyObj.new_value = req.body.status;
        History.create(historyObj,()=>{});
    }

    if (getSingleProduct.Key_features && 
        getSingleProduct.Key_features != req.body.Key_features) {
        historyObj.field_name = 'Key Features';
        historyObj.old_value = getSingleProduct.Key_features;
        historyObj.new_value = req.body.Key_features;
        History.create(historyObj,()=>{});
    }


    /*HISTORY END HERE*/

    await Media.deleteMany({ product: req.body.id });

    for (let i = 0; i < req.body.images.length; i++) {
        var Obj = {
            Doc_type: 'product',
            file_type: 'image',
            url: req.body.images[i].url,
            product: req.body.id,
            individual: req.body.individual
        }
        Media.create(Obj,()=>{});
    }

    for (let i = 0; i < req.body.video.length; i++) {
        var Obj = {
            Doc_type: 'product',
            file_type: 'video',
            url: req.body.video[i].url,
            product: req.body.id,
            individual: req.body.individual
        }
        Media.create(Obj,()=>{});
    }


    var ur = await Product.updateOne({ _id: req.body.id }, {
        $set: req.body
    });
    res.json({ message: "success", data: ur });
});

router.delete('/:id', async function(req, res, next) {
    var pp = await Product.updateOne({
        _id: req.params.id,
    }, {
        $set: {
            deleted: new Date().getTime(),
        },
    });

    // Seo tag to categorySeo deleted update
    var pcs = await productCatSeo.findOne({ product_id: req.params.id });
    if (pcs) {
        var cs = await categorySeo.findOne({ _id: pcs.category_seo_tag_id });
        categorySeo.updateOne({ _id: cs._id }, { $set: { deleted: new Date().getTime() } }).exec((err, result) => {});;
    }

    res.json({
        message: 'success',
        data: pp
    });
});

router.delete('/temp/:id', async function(req, res, next) {
    // var pp = await Temp_Product.updateOne({
    //     _id: req.params.id,
    // }, {
    //     $set: {
    //         deleted: 'yes',
    //     },
    // });

    Temp_Product.updateOne(
    { _id: req.params.id },
    {
        $set: {
            deleted: new Date().getTime(),
        },
    }).exec((err, result) => {});


    res.json({
        message: 'success',
    })
});

router.delete("/deleteMedia/:id", async function(req, res, next) {
    // Media.deleteOne({ _id: req.params.id }).exec((err, result) => {});
    Media.updateOne(
    { _id: req.params.id },
    {
        $set: {
            deleted: new Date().getTime(),
        },
    }).exec((err, result) => {});

    res.json({ message: "success" });
});

router.post("/product-categories", async function(req, res, next) {
    var product = await Product.findOne({ _id: req.body.product_id }, {categories: true});
    let cat = [];

    if (product && product.categories && product.categories.length) {
        for (let i in product.categories) {
            if (product.categories[i].category) {
                cat.push(product.categories[i].category); 
            }
        }
    }

    var result = await Category.find({ _id: {$in: cat} });
    res.json({ message: "success", data: result });
});

router.get("/allunderreview/product", async function(req, res, next) {
   
    var fetch = await Product.find({ deleted: null, product_status: "REVW" }).populate('individual market_type length_type weight_type packaging_type visibility_type categories').lean().sort({ createdAt: -1 });

        let status = [];
        for (let i in fetch) {
            status.push(fetch[i].product_status);
        }

        var mrkTyp = await CodeDomain.findOne({ code: 'PROWRKFLST' });
        var cdv = await CodeDomainValues.find({ deleted: null, codedomain: mrkTyp, code: {$in: status} }).sort({position:1,value:1}).lean();

        for (let i in fetch) {
            for (let k in cdv) {
                if (cdv[k].code == fetch[i].product_status) {
                    fetch[i].productStatus = cdv[k].value;
                }
            }
        }    

    res.json({ message: "success", data: fetch });
});


router.post("/csv/upload", multipartMiddleware, async function(req, res) {

    try {
        const jsonArray = await csvtojsonV2().fromFile(req.files.file['path']);

        // return;
        let notAddedData = [];
        let isError = false;

        if (jsonArray && jsonArray.length) {
            let count = 0;
            const loop = async () => {
                isError = false;

                if (count < jsonArray.length) {
                    jsonArray[count].deletedby = null;
                    jsonArray[count].editedby = null;
                    jsonArray[count].create_user = null;
                    jsonArray[count].deleted = null;
                    jsonArray[count].product_status = 'DRFTPL';
                    jsonArray[count].individual = req.body.userId;

                    var fetch = await CodeDomainValues.findOne({ deleted: null, value: jsonArray[count].market_type });
                    jsonArray[count].market_type = fetch && fetch._id ? fetch._id: null;
                    var fetch1 = await CodeDomainValues.findOne({ deleted: null, value: jsonArray[count].length_type });
                    jsonArray[count].length_type = fetch1 && fetch1._id ? fetch1._id: null;
                    var fetch2 = await CodeDomainValues.findOne({ deleted: null, value: jsonArray[count].weight_type });
                    jsonArray[count].weight_type = fetch2 && fetch2._id ? fetch2._id: null;
                    var fetch3 = await CodeDomainValues.findOne({ deleted: null, value: jsonArray[count].visibility_type });
                    jsonArray[count].visibility_type = fetch3 && fetch3._id ? fetch3._id: null;
                    var fetch4 = await CodeDomainValues.findOne({ deleted: null, value: jsonArray[count].packaging_type });
                    jsonArray[count].packaging_type = fetch4 && fetch4._id ? fetch4._id: null;

                    if (fetch == null || fetch1 == null || fetch2 == null || fetch3 == null || fetch4 == null) {
                        isError = true;
                    }

                    if (jsonArray[count].categories && jsonArray[count].categories.length) {
                        let category = jsonArray[count].categories.split(',');
                        console.log(category);

                        if (category.length) {
                            var parentCat = await Category.findOne({ status: 'active', parent:null, name: category[0],deleted: null });
                        
                            if (parentCat && parentCat._id) {
                                category.splice(0,1);
                 
                                jsonArray[count].categories = [{
                                    category: parentCat._id,
                                    is_new: "0",
                                }];

                                var catList = await Category.find({ status: 'active', name: {$in: category},deleted: null });
                                for (let i in catList) {
                                    jsonArray[count].categories.push({
                                         category: catList[i]._id,
                                        is_new: "0",
                                    });
                                }
                            } else {
                                isError = true;
                            }
                        } else {
                            isError = true;
                        }
                    } else {
                        isError = true;
                    }
                    
                    if (!isError) {
                        Product.create(jsonArray[count], (err, result)=>{
                           console.log(err, result);
                           count += 1;
                           loop();
                       });
                    } else {
                        notAddedData.push(jsonArray[count]);
                        count += 1;
                        loop();
                    }
                    
                } else {
                    // console.log(jsonArray);
                    res.json({ message: "Product created successfully", status: true, notAddedData: notAddedData });
                }
            }
            loop();
        } else {
            res.json({ message: "Something is wrong", status: false });
        }
    } catch(weee) {
        console.log(weee);
        res.json({ message: "Something is wrong", status: false });
    }
});

module.exports = router;