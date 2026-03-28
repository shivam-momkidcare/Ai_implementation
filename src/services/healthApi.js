const API_BASE_URL = "http://localhost:3000/api/health";

const DATE_FORMAT_OPTIONS = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

export const mapAdviceFromAi = (aiAdvice) => {
  if (!aiAdvice) return null;

  return [
    { ...aiAdvice.nutrition, type: "nutrition", icon: "🥗" },
    { ...aiAdvice.exercise, type: "exercise", icon: "🏃‍♀️" },
    { ...aiAdvice.warnings, type: "warning", icon: "⚠️" },
    { ...aiAdvice.reminders, type: "reminder", icon: "🏥" },
  ];
};

export const mapLogToHistoryEntry = (log) => ({
  date: new Date(log.createdAt || Date.now()).toLocaleDateString("en-IN", DATE_FORMAT_OPTIONS),
  week: log.week,
  symptoms: log.symptoms?.length || 0,
  data: {
    name: log.name || "",
    age: String(log.age || ""),
    week: String(log.week || "20"),
    weight: String(log.weight || ""),
    bp: String(log.vitals?.bp || "120"),
    sugar: String(log.vitals?.sugar || "90"),
    hb: String(log.vitals?.hb || "11.5"),
    symptoms: log.symptoms || [],
    diet: log.diet || "",
    activity: log.activity || "",
  },
  advice: mapAdviceFromAi(log.aiAdvice),
});

export const fetchHealthHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/history`);
  const payload = await response.json();

  if (!payload.success) {
    throw new Error("Failed to fetch health history.");
  }

  return (payload.logs || []).map(mapLogToHistoryEntry);
};

export const createHealthLog = async (form) => {
  const response = await fetch(`${API_BASE_URL}/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    referrerPolicy: "no-referrer",
    body: JSON.stringify({
      name: form.name,
      age: form.age,
      week: form.week,
      weight: form.weight,
      symptoms: form.symptoms,
      vitals: { bp: form.bp, sugar: form.sugar, hb: form.hb },
      diet: form.diet,
      activity: form.activity,
    }),
  });

  return response.json();
};
