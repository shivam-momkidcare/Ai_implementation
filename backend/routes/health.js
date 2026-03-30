const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/healthController");

// Chat mode
router.post("/chat", ctrl.chat);
router.get("/chat/history/:sessionId", ctrl.getConversation);

// Auth
router.post("/auth/signup", ctrl.signup);
router.post("/auth/login", ctrl.login);

// App mode
router.post("/onboarding/step", ctrl.onboardingStep);
router.get("/dashboard", ctrl.dashboard);
router.get("/vendors", ctrl.getVendors);
router.post("/user/update", ctrl.updateUser);

// Actions
router.post("/actions/execute", ctrl.executeAction);

module.exports = router;