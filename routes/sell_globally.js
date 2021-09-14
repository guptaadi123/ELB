const express = require('express');
const router = express.Router();
const Product = require("../models/product");
const CodeDomain = require("../models/code_domain");
const CodeDomainValue = require("../models/code_domainValues");
const marketplace_country = require("../models/marketplace_countries");
const marketplace_country_product = require("../models/marketplace_country_product");
const CodeDomainValues = require("../models/code_domainValues");
const roleModel = require('../models/role');
const userRole = require('../models/user_role');
const globalService = require("./global_service");
const BusMarketPlacecountry = require("../models/bus_marketplace_country");
const Bussiness = require("../models/bussiness");

router.get("/getAll", async function(req, res) {
    var obj = await Product.find().sort({ createdAt: -1 })
    res.json({ message: "success", data: obj });
});

// get All market-place
router.get("/get-market-place/:id", async function(req, res) {
    try {
        var bus = await Bussiness.findOne({ individual: req.params.id }, {_id: true});
        var BMC = await BusMarketPlacecountry.find({ bussiness: bus._id }).sort({ createdAt: -1 });

        let country = [];
        for (let i in BMC) {
            country.push(BMC[i].country);
        }

        var obj = await marketplace_country.find({_id: {$in: country}}).lean().sort({ createdAt: -1 });
        
        var check = await CodeDomain.findOne({ code: "CNTRY" });
        var fetch = await CodeDomainValues.find({ deleted: null,status:"active", codedomain: check }).sort({position:1,value:1});

        for (let i in obj) {
            for (let k in fetch) {
                if (obj[i].country_code == fetch[k].code) {
                    obj[i].country_name = fetch[k].value;
                }
            }
        }
 
        res.json({ message: "success", data: obj });
    } catch(errr) {
        res.json({ message: "success", data: [] });
    }
    
});

router.get("/:id", async function(req, res, next) {
    var Cr = await Product.findOne({ _id: req.params.id });
    if (!(Cr && Cr._id)) {
        Cr = await Product.find({ individual: req.params.id });
    }
    res.json({ message: "success", data: Cr });
});

router.post("/getAllBySeller", async function(req, res, next) {
    globalService.getByPageWFS(req, async (keyList) => {
 
        var userrole = await userRole.findOne({ userId: req.body.userId },{ roleId :true });
        var rolem = await roleModel.findOne({ _id: userrole.roleId },{ name :true });

        if (rolem.name == 'Super Admin') {
            var Cr = await Product.find({deleted: null,product_status: { $in: keyList }}).lean();
        } else {
            var Cr = await Product.find({deleted: null,product_status: { $in: keyList }, individual: req.body.userId }).lean();
        }

        let ids = [];
        let proStatus = [];
        if(Cr && Cr.length){
            for (let i in Cr) {
                ids.push(Cr[i]._id)
                proStatus.push(Cr[i].product_status)
            }
        }

        var data = await marketplace_country_product.find({ deleted: null, product_id: {$in : ids} }).populate('marketplace_country_id')
        let finalData = [];

        for(let k in data){
            for(let j in Cr){
                if(data[k].product_id == Cr[j]._id && !Cr[j].country_code_id) {
                    Cr[j].country_code = data[k].marketplace_country_id.country_code;
                    Cr[j].country_code_id = data[k].marketplace_country_id._id;
                }
            }
        }

        let check = await CodeDomainValues.find({ status: "active", deleted: null, code: { $in: proStatus } },{ value: true, code: true }).sort({position:1,value:1});

        for (let i in Cr) {
            for (let k in check) {
                if (check[k].code == Cr[i].product_status) {
                    Cr[i].product_status = check[k].value;
                }
            }
            finalData.push(Cr[i]);
        }

        for(let j in Cr){
            for(let k in data){
                    if(data[k].product_id == Cr[j]._id && Cr[j].country_code_id != data[k].marketplace_country_id._id) {
                        let tmpRow = JSON.parse(JSON.stringify(Cr[j]));
                        tmpRow.country_code = data[k].marketplace_country_id.country_code;
                        tmpRow.country_code_id = data[k].marketplace_country_id._id;
                        finalData.push(tmpRow);
                    }
                }
        }

        res.json({ message: "success", data: finalData });
    })
});

//############################ UPDATE complete record #########################
router.post("/update", async function(req, res) {

    let count = 0;
    const loop = async () => {
        if (count < req.body.length) {
            var data = await marketplace_country_product.findOne({ product_id: req.body[count].product_id, marketplace_country_id: req.body[count].marketplace_country_id, deleted: null});
            
            if (!data) {
                var result = await marketplace_country_product.create(req.body[count]);
            }

            count += 1;
            loop()
        } else {
            res.json({ message: "success" });
        }
    }
    loop();

});

//############################ END ###########################################
router.delete("/:id/:key", async function(req, res) {
  //  marketplace_country_product.updateOne({ product_id: req.params.id, marketplace_country_id: req.params.key },{
  //   $set: {
  //       deleted: new Date().getTime()
  //   }
  // }).exec((err, result) => {
  //    res.json({ message: "success" });
  // });

    marketplace_country_product.updateOne(
    { product_id: req.params.id, marketplace_country_id: req.params.key },
    {
        $set: {
            deleted: new Date().getTime(),
        },
    }).exec((err, result) => {});

    res.json({ message: "success" });
});

router.post("/create", async function(req, res) {
    var isExist = await Product.findOne({ name: req.body.name });
    if (isExist) {
        res.json({ message: "already" });
    } else {
        var result = await Product.create(req.body);
        res.json({ message: "success", data: result });
    }
});

router.get("/", async function(req, res) {
    res.send('hello from communication compositions');
});

// Get Varaible  
router.post("/get-variables", async function (req, res, next) {
    let obj = await CodeDomain.findOne({
        code: 'CTV',
    });
    let qusmst = await CodeDomainValue.find({
        codedomain: obj._id,status:"active"
    }).sort({position:1,value:1});

    res.json({ message: "success", data: qusmst });
});

module.exports = router;