const API_BASE = "http://localhost:3000/api";

const post = async (url, body) => {
  const res = await fetch(`${API_BASE}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
};

const get = async (url) => {
  const res = await fetch(`${API_BASE}${url}`);
  return res.json();
};

// ─── Chat ───
export async function sendMessage(message, sessionId, mode = "chat") {
  const data = await post("/chat", { message, sessionId, mode });
  if (!data.success) throw new Error(data.error || "Chat request failed");
  return data;
}

export async function getConversationHistory(sessionId) {
  return get(`/chat/history/${encodeURIComponent(sessionId)}`);
}

// ─── Actions ───
export async function executeAction(actionType, params = {}) {
  return post("/actions/execute", { actionType, params });
}

// ─── Auth ───
export async function signup(name, email, phone) {
  return post("/auth/signup", { name, email, phone });
}

export async function login(email) {
  return post("/auth/login", { email });
}

// ─── Onboarding ───
export async function onboardingStep(userId, step, previousAnswers = {}) {
  return post("/onboarding/step", { userId, step, previousAnswers });
}

// ─── Dashboard ───
export async function getDashboard(userId) {
  return get(`/dashboard?userId=${encodeURIComponent(userId)}`);
}

// ─── Vendors ───
export async function getVendors({ userId, type } = {}) {
  const params = new URLSearchParams();
  if (userId) params.set("userId", userId);
  if (type) params.set("type", type);
  return get(`/vendors?${params.toString()}`);
}

// ─── User ───
export async function updateUser(userId, updates) {
  return post("/user/update", { userId, ...updates });
}