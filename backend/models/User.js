const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    role: { type: String, enum: ["mother", "parent", "caregiver"], default: "mother" },
    onboarded: { type: Boolean, default: false },
    profile: {
      age: Number,
      pregnancyWeek: Number,
      dueDate: Date,
      childAge: String,
      bloodGroup: String,
      height: String,
      weight: String,
      city: String,
      preferredLanguage: { type: String, default: "en" },
    },
    healthContext: { type: Object, default: {} },
    preferences: {
      notifications: { type: Boolean, default: true },
      theme: { type: String, default: "light" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
