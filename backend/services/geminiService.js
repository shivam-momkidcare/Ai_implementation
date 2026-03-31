const axios = require("axios");

async function getPregnancyAdvice(data) {
  try {
    const prompt = `
You are a compassionate prenatal health assistant.
Return ONLY JSON (no markdown, no backticks).

Patient Data:
- Pregnancy Week: ${data.week}
- Age: ${data.age}
- Weight: ${data.weight}
- Symptoms: ${data.symptoms.join(", ") || "none"}
- Blood Pressure: ${data.vitals.bp}
- Blood Sugar: ${data.vitals.sugar}
- Hemoglobin: ${data.vitals.hb}
- Diet: ${data.diet}
- Activity: ${data.activity}

Return exactly this JSON:
{
  "nutrition": { "title": "Diet & Nutrition", "items": ["", "", "", ""] },
  "exercise":  { "title": "Movement & Exercise", "items": ["", "", ""] },
  "warnings":  { "title": "Warning Signs", "items": ["", "", ""] },
  "reminders": { "title": "Doctor Reminders", "items": ["", "", ""] }
}
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    const text = response.data.candidates[0].content.parts[0].text;
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);

  } catch (error) {
    console.error("Gemini Error:", error.response?.data || error.message);

    // ✅ fallback so app never crashes
    return {
      nutrition: { title: "Diet & Nutrition",    items: ["Unable to generate advice. Please try again."] },
      exercise:  { title: "Movement & Exercise", items: ["Unable to generate advice. Please try again."] },
      warnings:  { title: "Warning Signs",       items: ["Unable to generate advice. Please try again."] },
      reminders: { title: "Doctor Reminders",    items: ["Unable to generate advice. Please try again."] },
    };
  }
}

module.exports = { getPregnancyAdvice, askWithContext };

async function askWithContext(context, question) {
  try {
    const prompt = `You are a compassionate prenatal health assistant.
Based on the following patient records:

${context}

Answer this question: ${question}

IMPORTANT: Return ONLY valid JSON (no markdown, no backticks).
Return an object with a "sections" array. Each section has:
- "title": short heading
- "icon": a single relevant emoji
- "type": one of "insight", "warning", "tip", "stat"
- "items": array of short bullet-point strings

Return as many sections as needed (2-6) based on the question complexity.
Example format:
{
  "sections": [
    { "title": "Key Findings", "icon": "🔍", "type": "insight", "items": ["Point 1", "Point 2"] },
    { "title": "Recommendations", "icon": "💡", "type": "tip", "items": ["Tip 1", "Tip 2"] }
  ]
}`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );

    const text = response.data.candidates[0].content.parts[0].text;
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini askWithContext Error:", error.response?.data || error.message);
    return {
      sections: [
        { title: "Error", icon: "⚠️", type: "warning", items: ["Unable to generate answer. Please try again."] }
      ]
    };
  }
}