const axios = require("axios");

exports.getEmbedding = async (text) => {
  try {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

    const res = await axios.post(
      `${endpoint}/openai/deployments/${deployment}/embeddings?api-version=${apiVersion}`,
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