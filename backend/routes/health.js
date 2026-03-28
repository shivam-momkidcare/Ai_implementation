const express = require("express");
const router = express.Router();
const { logHealth, getHistory } = require("../controllers/healthController");

router.post("/log", logHealth);
router.get("/history", getHistory);

module.exports = router;