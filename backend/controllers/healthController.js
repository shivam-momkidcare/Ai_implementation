const HealthLog = require("../models/HealthLog");
const { getPregnancyAdvice } = require("../services/geminiService");

// POST /api/health/log
exports.logHealth = async (req, res) => {
  try {
    const { name, age, week, weight, symptoms, vitals, diet, activity } = req.body;

    console.log("📥 Received data:", req.body); // debug log

    // 1. Get AI advice
    const aiAdvice = await getPregnancyAdvice(req.body);
    console.log("🤖 AI Advice:", aiAdvice); // debug log

    // 2. Save to MongoDB with type casting
    const log = await HealthLog.create({
      name,
      age:    Number(age),
      week:   Number(week),
      weight: Number(weight),
      symptoms,
      vitals: {
        bp:    Number(vitals.bp),
        sugar: Number(vitals.sugar),
        hb:    Number(vitals.hb),
      },
      diet,
      activity,
      aiAdvice,
    });

    console.log("✅ Saved to DB:", log._id); // debug log

    res.status(201).json({ success: true, log });

  } catch (err) {
    console.error("❌ Error saving:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/health/history
exports.getHistory = async (req, res) => {
  try {
    const logs = await HealthLog.find().sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};