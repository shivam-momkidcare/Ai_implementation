const HealthLog = require("../models/HealthLog");
const { getPregnancyAdvice, askWithContext } = require("../services/geminiService");
const { getEmbedding } = require("../utils/embedding");

const MIN_SCORE = 0.55;
const SCORE_RATIO = 0.9;

function buildEmbeddingText({ name, week, symptoms, vitals, diet, activity, aiAdvice }) {
  return [
    `Name: ${name}`,
    `Week: ${week}`,
    `Symptoms: ${symptoms.join(", ")}`,
    `BP: ${vitals.bp}`,
    `Sugar: ${vitals.sugar}`,
    `HB: ${vitals.hb}`,
    `Diet: ${diet}`,
    `Activity: ${activity}`,
    `Advice: ${JSON.stringify(aiAdvice)}`,
  ].join("\n");
}

function filterByScore(results) {
  let filtered = results.filter((r) => r.score >= MIN_SCORE);
  if (filtered.length > 0) {
    const cutoff = filtered[0].score * SCORE_RATIO;
    filtered = filtered.filter((r) => r.score >= cutoff);
  }
  return filtered;
}

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

async function runVectorSearch(queryEmbedding, limit = 10) {
  const docs = await HealthLog.find({ embedding: { $exists: true, $ne: [] } }).lean();
  const scored = docs
    .map((doc) => {
      const score = cosineSimilarity(queryEmbedding, doc.embedding);
      const { embedding, ...rest } = doc;
      return { ...rest, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return scored;
}

// POST /api/health/log
exports.logHealth = async (req, res) => {
  try {
    const { name, age, week, weight, symptoms, vitals, diet, activity } = req.body;

    const aiAdvice = await getPregnancyAdvice(req.body);
    const embeddingText = buildEmbeddingText({ name, week, symptoms, vitals, diet, activity, aiAdvice });
    const embedding = await getEmbedding(embeddingText);

    const log = await HealthLog.create({
      name,
      age: Number(age),
      week: Number(week),
      weight: Number(weight),
      symptoms,
      vitals: {
        bp: Number(vitals.bp),
        sugar: Number(vitals.sugar),
        hb: Number(vitals.hb),
      },
      diet,
      activity,
      aiAdvice,
      embedding,
    });

    console.log("✅ Saved:", log._id);
    res.status(201).json({ success: true, log });
  } catch (err) {
    console.error("❌ Log error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/health/history
exports.getHistory = async (req, res) => {
  try {
    const logs = await HealthLog.find({}, { embedding: 0 }).sort({ createdAt: -1 });
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/health/search
exports.vectorSearch = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: "Query required" });
    }

    console.log("🔍 Search query:", query);

    const queryEmbedding = await getEmbedding(query);
    const results = await runVectorSearch(queryEmbedding);
    const filtered = filterByScore(results);

    console.log("🔍 Results:", filtered.length);
    res.json({ success: true, results: filtered });
  } catch (err) {
    console.error("❌ Search error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/health/ask
exports.askAI = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: "Query required" });
    }

    const queryEmbedding = await getEmbedding(query);
    const docs = await runVectorSearch(queryEmbedding, 3);

    const context = docs
      .map(
        (d) =>
          `Patient: ${d.name}, Week: ${d.week}, BP: ${d.vitals.bp}, Sugar: ${d.vitals.sugar}, Symptoms: ${d.symptoms.join(", ")}`
      )
      .join("\n");

    const answer = await askWithContext(context, query);
    res.json({ success: true, answer, matchedRecords: docs });
  } catch (err) {
    console.error("❌ Ask error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};