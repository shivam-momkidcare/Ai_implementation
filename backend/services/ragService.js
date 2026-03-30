const Knowledge = require("../models/Knowledge");
const { getEmbedding } = require("../utils/embedding");

const VECTOR_INDEX = "knowledge_vector_index";
const MIN_SCORE = 0.5;
const DEFAULT_LIMIT = 5;

async function retrieveContext(query, limit = DEFAULT_LIMIT) {
  try {
    const queryEmbedding = await getEmbedding(query);

    const results = await Knowledge.aggregate([
      {
        $vectorSearch: {
          index: VECTOR_INDEX,
          queryVector: queryEmbedding,
          path: "embedding",
          numCandidates: 100,
          limit,
        },
      },
      {
        $project: {
          category: 1,
          title: 1,
          content: 1,
          tags: 1,
          metadata: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    const filtered = results.filter((r) => r.score >= MIN_SCORE);

    return filtered.map((doc) => ({
      category: doc.category,
      title: doc.title,
      content: doc.content,
      tags: doc.tags,
      metadata: doc.metadata,
      score: doc.score,
    }));
  } catch (err) {
    console.error("RAG retrieval error:", err.message);
    return [];
  }
}

function formatContextForPrompt(documents) {
  if (!documents.length) return "No relevant internal data found.";

  return documents
    .map(
      (doc, i) =>
        `[Source ${i + 1}] (${doc.category}) ${doc.title}\n${doc.content}`
    )
    .join("\n\n");
}

module.exports = { retrieveContext, formatContextForPrompt };
