const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    upc_code: String,
    style_code: String,
    hsn_code: String,
    gst_rate: String,
    product_name: String,
    brand_name: String,
    product_quantity: String,
    product_desc: String,
    color_type: String, //(pallet/hex/pantone)
    market_type: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain_values" },
    color_value: String,
    hex_color_value: String,
    color_opetion_available: String,
    size_applicable: String,
    key_features: String,
    additional_info: String,
    product_length: String,
    product_breadth: String,
    product_height: String,
    product_weight: String,
    product_diameter: String,
    length_type: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain_values" }, //(CM/inch)
    weight_type: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain_values" },
    packaging_type: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain_values" },
    others_packaging_type: String,

    packaging_type_other: String,
    package_length: String,
    package_breadth: String,
    package_height: String,
    package_weight: String,
    package_diameter: String,
    items_incld_in_pack: String,
    theme_content: String,
    productionTime: String,
    status: String,
    planned_product: String,
    video_url: String,
    create_user: Number,
    deleted: String,
    country_code: String,
    product_status: String,
    tags: [],
    images360: {},
    categories: [
        { category: { type: mongoose.Schema.Types.ObjectId, ref: "category" }, is_new: String}
    ],
    editedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    visibility_type: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain_values" }, //(All, Only International, Registered Buyer)
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    individual: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },

}, { timestamps: true })
module.exports = mongoose.model('product', schema)