const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    salutation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "codedomain_values",
    },
    password: String,
    firstname: String,
    middlename: String,
    lastname: String,
    profile: String,
    dob: Date,
    descreption: String,
    status: String,
    seller_status: String,
    status_reason: String,
    reason_descreption: String,
    create_user: Number,
    editedby: Number,
    deleted: String,
    skype: String,
    twitter: String,
    facebook: String,
    linkden: String,
    sellOnwebsite: String,
    registration_source: String,
    registration_source_other: String,
    Product_Craft_name: String,
    Product_Craft_desc: String,
    role: {
      type: String,
      default: "user",
    },
    deletedby: { type: mongoose.Schema.Types.ObjectId, ref: "individual" },
    phonebook: { type: mongoose.Schema.Types.ObjectId, ref: "phonebook" },
    email_address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "email_address",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("individual", schema);
