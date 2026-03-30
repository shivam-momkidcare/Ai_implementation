require("dotenv").config();
const mongoose = require("mongoose");
const HL = require("./models/HealthLog");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Check actual embedding length using raw collection
  const doc = await HL.collection.findOne({}, { projection: { name: 1, embeddingLen: { $size: "$embedding" } } });
  console.log("Actual embedding length:", JSON.stringify(doc));
  
  await mongoose.disconnect();
})();
