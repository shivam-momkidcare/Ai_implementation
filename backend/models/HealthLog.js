const mongoose = require("mongoose");

const HealthLogSchema = new mongoose.Schema(
  {
    name:     { type: String },
    age:      { type: Number },
    week:     { type: Number, required: true },
    weight:   { type: Number },
    symptoms: [String],
    vitals: {
      bp:    { type: Number },
      sugar: { type: Number },
      hb:    { type: Number },
    },
    diet:     { type: String },
    activity: { type: String },
    aiAdvice: { type: Object },
  },
  { timestamps: true, strict: false } // ✅ fixed — merged into one object
);

module.exports = mongoose.model("HealthLog", HealthLogSchema);