require("dotenv").config();
const mongoose = require("mongoose");
const HL = require("./models/HealthLog");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const col = HL.collection;

  // 1. Drop the wrong "default" search index
  try {
    console.log('Dropping old "default" search index...');
    await col.dropSearchIndex("default");
    console.log("Dropped.");
  } catch (e) {
    console.log("Could not drop default index:", e.message);
  }

  // 2. Create the correct vectorSearch index
  try {
    console.log('Creating "vector_index" (type: vectorSearch)...');
    await col.createSearchIndex({
      name: "vector_index",
      type: "vectorSearch",
      definition: {
        fields: [
          {
            type: "vector",
            path: "embedding",
            numDimensions: 3072,
            similarity: "cosine",
          },
        ],
      },
    });
    console.log("Created! It may take a minute to become READY.");
  } catch (e) {
    console.log("Error creating index:", e.message);
  }

  // 3. Verify
  await new Promise((r) => setTimeout(r, 3000));
  const indexes = await col.listSearchIndexes().toArray();
  console.log("\nCurrent indexes:");
  indexes.forEach((idx) =>
    console.log(`  - name: "${idx.name}", type: "${idx.type}", status: ${idx.status}`)
  );

  await mongoose.disconnect();
})();
