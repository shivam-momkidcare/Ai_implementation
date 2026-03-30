const HealthLog = require("../models/HealthLog");
const { getPregnancyAdvice } = require("../services/geminiService");
const { getEmbedding } = require("../utils/embedding");

// POST /api/health/log
exports.logHealth = async (req, res) => {
  try {
    const { name, age, week, weight, symptoms, vitals, diet, activity } = req.body;

    console.log("📥 Received data:", req.body);

    // ✅ 1. AI Advice
    const aiAdvice = await getPregnancyAdvice(req.body);
    console.log("🤖 AI Advice:", aiAdvice);

    // ✅ 2. Embedding text (VERY IMPORTANT 🔥)
    const textForEmbedding = `
    Name: ${name}
    Week: ${week}
    Symptoms: ${symptoms.join(", ")}
    BP: ${vitals.bp}
    Sugar: ${vitals.sugar}
    HB: ${vitals.hb}
    Diet: ${diet}
    Activity: ${activity}
    Advice: ${JSON.stringify(aiAdvice)}
    `;

    // ✅ 3. Generate embedding
    const embedding = await getEmbedding(textForEmbedding);

    console.log("🧠 Embedding length:", embedding.length);

    // ✅ 4. Save everything
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
      embedding, // 🔥 ADD THIS
    });

    console.log("✅ Saved to DB:", log._id);

    res.status(201).json({ success: true, log });

  } catch (err) {
    console.error("❌ Error saving:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/health/history
exports.getHistory = async (req, res) => {
  try {
    const logs = await HealthLog.find()
      .sort({ createdAt: -1 }); // ❌ limit hata diya

    res.json({
      success: true,
      logs,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};


exports.vectorSearch = async (req, res) => {
  try {
    const { query } = req.body;
    console.log("🔍 Search query:", query);

    if (!query) {
      return res.status(400).json({ success: false, error: "Query required" });
    }

    // 🔥 1. Convert query → embedding
    const queryEmbedding = await getEmbedding(query);

    // 🔥 2. Vector search
    const results = await HealthLog.aggregate([
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
    console.log("🔍 Search results:", results);
    res.json({ success: true, results });

  } catch (err) {
    console.error("❌ Vector Search Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.askAI = async (req, res) => {
  try {
    const { query } = req.body;

    // 1. vector search
    const queryEmbedding = await getEmbedding(query);

    const docs = await HealthLog.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          queryVector: queryEmbedding,
          path: "embedding",
          numCandidates: 50,
          limit: 3,
        },
      },
    ]);

    // 2. context build
    const context = docs.map(d => `
    Name: ${d.name}
    Week: ${d.week}
    BP: ${d.vitals.bp}
    Sugar: ${d.vitals.sugar}
    Advice: ${JSON.stringify(d.aiAdvice)}
    `).join("\n");

    // 3. send to Gemini
    const finalPrompt = `
    Based on below patient history:

    ${context}

    Answer this:
    ${query}
    `;

    const answer = await getPregnancyAdvice({ customPrompt: finalPrompt });

    res.json({ success: true, answer });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};