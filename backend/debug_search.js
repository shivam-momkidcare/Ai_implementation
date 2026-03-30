require("dotenv").config();
const mongoose = require("mongoose");
const HL = require("./models/HealthLog");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  const count = await HL.countDocuments();
  const withEmb = await HL.countDocuments({ embedding: { $exists: true, $ne: [] } });
  const sample = await HL.findOne({}, { embedding: { $slice: 3 }, name: 1, week: 1 });
  
  console.log("Total docs:", count);
  console.log("Docs with embedding:", withEmb);
  console.log("Sample doc:", JSON.stringify(sample, null, 2));
  
  if (sample && sample.embedding) {
    console.log("Embedding length:", sample.embedding.length);
    console.log("Embedding type:", typeof sample.embedding[0]);
  }
  
  try {
    const indexes = await HL.collection.listSearchIndexes().toArray();
    console.log("Search indexes:", JSON.stringify(indexes, null, 2));
  } catch (e) {
    console.log("Could not list search indexes:", e.message);
  }
  
  await mongoose.disconnect();
})();
