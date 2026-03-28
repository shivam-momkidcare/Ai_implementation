const express = require("express");
const cors = require("cors");
const mongoose  = require("mongoose");
const { getPregnancyAdvice } = require("./services/geminiService");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

/* ================= API ROUTE ================= */
app.post("/api/health/log", async (req, res) => {
  try {
    const data = req.body;
    const aiAdvice = await getPregnancyAdvice(data);

    res.json({
      success: true,
      log: { aiAdvice },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "AI failed",
    });
  }
});

app.use("/api/health", require("./routes/health.js"));

/* ================= START SERVER ================= */
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});