const mongoose = require("mongoose");

const KnowledgeSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [String],
    metadata: { type: Object, default: {} },
    embedding: { type: [Number] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Knowledge", KnowledgeSchema);