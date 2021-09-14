var express = require("express");
var router = express.Router();
const Category = require("../models/category");
const globalService = require('./global_service');
const media = require("../models/media");

router.get("/getAll", async function(req, res, next) {
    var Cr = await Category.find({ deleted: null }).lean().sort({
        createdAt: -1,
    });
    res.json({ message: "success", data: Cr });
});

router.get("/getAllTreeCat", async function (req, res, next) {
    var cats = await Category.find({ status: 'active', deleted: null }).lean().sort({
        createdAt: 1,
    });
    for (let i in cats) {
        cats[i].checked = false;
    }

    const list_to_tree = (list) => {
      var map = {}, node, roots = [], i;
      
      for (i = 0; i < list.length; i += 1) {
        map[list[i]._id] = i;
        list[i].children = [];
      }

      for (i = 0; i < list.length; i += 1) {
        node = list[i];
        node.text = node.name;
        node.value = node._id;
        node.collapsed = false;

        if (!node.checked) {
            node.checked = false;
        }
        
        if (node.parent) {
            try {
                if (list[map[node.parent]].children) {
                    list[map[node.parent]].children.push(node);
                }
            } catch(erer) {
                
            }
        } else {
          roots.push(node);
        }
      }

      return roots;
    }

    let service = await list_to_tree(cats);

    res.json({ message: "success", data: service });
});

router.get("/getAllSubCategory", async function(req, res, next) {
    var Cr = await Category.find({ parent: { $ne: null } }).sort({
        createdAt: -1,
    });
    res.json({ message: "success", data: Cr });
});

router.get("/getAllByparent/:parent", async function(req, res, next) {
    var Cr = await Category.find({ parent: req.params.parent }).sort({
        createdAt: -1,
    });
    res.json({ message: "success", data: Cr });
});

router.post("/create", async function(req, res, next) {
    let result = await Category.create(req.body);
    req.body.images.parent_entity_id = result._id;
    media.create(req.body.images);
    res.json({ message: "success" });
});

router.post("/newCategoryCreate", async function(req, res, next) {
    let count = 0;
    let parentId = null;
    let resData = [];

    var Cr = await Category.findOne({ parent: null, name: req.body[0].name });
    if (Cr && Cr._id) {
        res.json({ message: "This category is in review, it will approve within 48 hours", data: [] });
        return;
    }

    const saveCat = async () => {
        if (count < req.body.length) {
            req.body[count].parent = parentId;
            let data = await Category.create(req.body[count]);
            resData.push(data);
            parentId = data._id;
            count += 1;
            saveCat();
        } else {
            res.json({ message: "success",data:resData });
        }
    }
    saveCat();
});

router.post("/newSubCategoryCreate", async function(req, res, next) {
    let resData = [];

    var Cr = await Category.findOne({ parent: req.body[0].parent, name: req.body[0].name });

    if (Cr && Cr._id) {
        res.json({ message: "This category is in review, it will approve within 48 hours.", data: [] });
        return;
    }

    let count = 0;
    let parentId = req.body[0].parent;

    const saveCat = async () => {
        if (count < req.body.length) {
            req.body[count].parent = parentId;
            let data = await Category.create(req.body[count]);
            resData.push(data);
            parentId = data._id;
            count += 1;
            saveCat();
        } else {
            res.json({ message: "success",data:resData });
        }
    }
    saveCat();
});

router.get("/:id", async function(req, res, next) {
    var Cr = await Category.findOne({ _id: req.params.id }).lean();
    var img = await media.findOne({ parent_entity_id: req.params.id }).sort({ createdAt: -1 });
    Cr.images = img;
    res.json({ message: "success", data: Cr });
});

router.delete('/:id/:userId', async function(req, res, next) {

    // var CR = await Category.updateOne({
    //     _id: req.params.id,
    // }, {
    //     $set: {
    //         deleted: new Date().getTime(),
    //         deletedby:req.params.userId
    //     },
    // });

    // res.json({
    //     message: 'success',
    //     data: CR
    // })


    Category.updateOne(
        { _id: req.params.id },
        {
            $set: {
                deleted: new Date().getTime(),
                deletedby:req.params.userId
            },
        }
    ).exec((err, result) => {});

    res.json({
        message: 'success'
    })
})

router.post("/update", async function(req, res, next) {
    console.log('req.body',req.body);
    
    var ur = await Category.updateOne({ _id: req.body.id }, {
        $set: req.body
    }).lean();

    if(req.body && req.body.images && req.body.images._id){
        await media.deleteOne({ _id: req.body.images._id });
        req.body.images.parent_entity_id = req.body.id;
        let img = await media.create(req.body.images);
        ur.images = img;
    }else{
        if(req.body && req.body.images && req.body.images.url){
            req.body.images.parent_entity_id = req.body.id;
            await media.create(req.body.images);
        }
    }
    
    res.json({ message: "success", data: ur });
});


router.post("/approveCat", async function(req, res, next) {

    for (let i in req.body) {
        var ur = await Category.updateOne({ _id: req.body[i].id }, {
            $set: req.body[i]
        });

        let body = {
            userId:req.body[i].create_user
        }

        if(req.body[i].status == "active") {
            globalService.emailTemplateSend("Category Approve", body, (eventTemplate)=> {
                res.json({ message: "success"});
            });
        } else {
            globalService.emailTemplateSend("Category Reject", body, (eventTemplate)=> {
                res.json({ message: "success"});
            });
        }
        
        res.json({ message: "success", data: ur });
    }
});


module.exports = router;