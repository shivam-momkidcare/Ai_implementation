const axios = require("axios");

exports.getEmbedding = async (text) => {
  try {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;

    const res = await axios.post(
      `${endpoint}/openai/deployments/text-embedding-3-large/embeddings?api-version=2024-02-15-preview`,
      {
        input: text,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.AZURE_OPENAI_API_KEY,
        },
      }
    );

    return res.data.data[0].embedding;

  } catch (err) {
    console.error("❌ Embedding Error:", err.response?.data || err.message);
    throw err;
  }
};