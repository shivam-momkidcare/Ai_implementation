const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  uiSchema: { type: Object, default: null },
  timestamp: { type: Date, default: Date.now },
});

const ConversationSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    messages: [MessageSchema],
    context: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
