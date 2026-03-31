const axios = require("axios");

exports.getEmbedding = async (text) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
      {
        model: "models/gemini-embedding-001",
        content: { parts: [{ text }] },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return res.data.embedding.values;

  } catch (err) {
    console.error("❌ Embedding Error:", err.response?.data || err.message);
    throw err;
  }
};