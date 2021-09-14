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
    color_value: String,
    hex_color_type: String, //(pallet/hex/pantone)
    hex_color_value: String,
    size_applicable: String,
    key_features: String,
    additional_info: String,
    product_length: String,
    product_breadth: String,
    product_height: String,
    product_weight: String,
    product_diameter: String,
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
    create_user: Number,
    deleted: String,
    country_code: String,
    tags: [],
    market_type: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain_values" },
    length_type: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain_values" }, //(CM/inch)
    weight_type: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain_values" }, //(Pound/kg)
    packaging_type: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain_values" },
    categories: [{ category: { type: mongoose.Schema.Types.ObjectId, ref: "category" } }],
    editedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    visibility_type: { type: mongoose.Schema.Types.ObjectId, ref: "codedomain_values" }, //(All, Only International, Registered Buyer)
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    individual: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },

}, { timestamps: true })
module.exports = mongoose.model('temp_product', schema)