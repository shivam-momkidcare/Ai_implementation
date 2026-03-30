const express = require("express");
const router = express.Router();
const { logHealth, getHistory, vectorSearch, askAI } = require("../controllers/healthController");

router.post("/log", logHealth);
router.get("/history", getHistory);
router.post("/search", vectorSearch);
router.post("/ask", askAI);

module.exports = router;