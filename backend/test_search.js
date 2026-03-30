require("dotenv").config();
const mongoose = require("mongoose");
const HL = require("./models/HealthLog");
const { getEmbedding } = require("./utils/embedding");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const query = "headache";
  console.log("Query:", query);

  const queryEmbedding = await getEmbedding(query);
  console.log("Embedding generated, length:", queryEmbedding.length);

  const results = await HL.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        queryVector: queryEmbedding,
        path: "embedding",
        numCandidates: 100,
        limit: 10,
      },
    },
    {
      $project: {
        name: 1,
        week: 1,
        symptoms: 1,
        vitals: 1,
        aiAdvice: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  console.log("Results count:", results.length);
  results.forEach((r) =>
    console.log(`  - ${r.name} (week ${r.week}, score: ${r.score})`)
  );

  await mongoose.disconnect();
})();
