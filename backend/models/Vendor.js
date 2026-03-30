const mongoose = require("mongoose");

const VendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["nanny", "doctor", "dietitian", "lactation_consultant", "physiotherapist", "doula", "pediatrician", "mental_health", "yoga_instructor", "other"],
      index: true,
    },
    photo: { type: String, default: "" },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    experience: { type: String },
    specializations: [String],
    languages: [String],
    city: { type: String, index: true },
    area: { type: String },
    price: { type: String },
    priceValue: { type: Number },
    available: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
    bio: { type: String },
    phone: { type: String },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", VendorSchema);
