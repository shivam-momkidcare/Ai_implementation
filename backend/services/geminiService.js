const axios = require("axios");
const { retrieveContext, formatContextForPrompt } = require("./ragService");

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

const UI_COMPONENTS_SPEC = `## UI Component Types (all AI-generated, no hardcoded UI):
Each UI component is an object with "type", "props", and optionally "children".

Available types:
- "container": Wrapper. props: { variant: "card"|"section"|"highlight"|"warning"|"success"|"info"|"glass"|"gradient", padding: "sm"|"md"|"lg" }. Has "children" array.
- "text": Text. props: { variant: "hero"|"heading"|"subheading"|"body"|"caption"|"label", content: "string", color: "default"|"muted"|"accent"|"success"|"warning"|"danger"|"white" }
- "button": Action. props: { label: "string", action: "action_key", variant: "primary"|"secondary"|"outline"|"danger"|"ghost"|"gradient", icon: "emoji", size: "sm"|"md"|"lg", fullWidth: true|false }
- "list": List. props: { variant: "bullet"|"numbered"|"checklist"|"spaced", items: ["string"] }
- "alert": Banner. props: { variant: "info"|"warning"|"success"|"danger", title: "string", message: "string" }
- "grid": Grid layout. props: { columns: 2|3|4, gap: "sm"|"md"|"lg" }. Has "children" array.
- "badge": Badge. props: { label: "string", variant: "default"|"success"|"warning"|"danger"|"accent"|"outline" }
- "divider": Horizontal line. No props needed.
- "progress": Progress bar. props: { label: "string", value: 0-100, color: "default"|"success"|"warning"|"danger" }
- "stat": Stat card. props: { label: "string", value: "string", icon: "emoji", trend: "up"|"down"|"neutral" }
- "input": Input field. props: { label: "string", placeholder: "string", inputType: "text"|"number"|"email"|"tel"|"select"|"textarea"|"date", field: "field_name", options: ["string"], required: true|false }
- "image": Image. props: { src: "url", alt: "string", rounded: true|false }
- "avatar": User avatar. props: { name: "string", src: "url", size: "sm"|"md"|"lg" }
- "chip": Selectable tag. props: { label: "string", selected: true|false, action: "action_key" }
- "accordion": Expandable section. props: { title: "string", content: "string", defaultOpen: true|false }
- "timeline": Timeline. props: { items: [{ title: "string", description: "string", status: "completed"|"current"|"upcoming", icon: "emoji" }] }
- "vendorCard": Vendor/service card. props: { name: "string", type: "string", rating: number, experience: "string", price: "string", specializations: ["string"], verified: true|false, avatar: "emoji", action: "action_key" }
- "tabs": Tab group. props: { items: [{ label: "string", id: "string" }], activeTab: "string" }. Each tab's content goes in "children" array with matching tab id.
- "carousel": Horizontal scroll. props: { }. Has "children" array.
- "metric": Big metric display. props: { value: "string", label: "string", icon: "emoji", color: "accent"|"success"|"warning"|"danger", subtitle: "string" }
- "banner": Hero banner. props: { title: "string", subtitle: "string", gradient: "pink"|"blue"|"green"|"purple"|"warm", icon: "emoji" }. Has optional "children" for CTA buttons.
- "stepIndicator": Step progress. props: { steps: [{ label: "string", status: "completed"|"current"|"upcoming" }] }
- "emptyState": Empty state. props: { icon: "emoji", title: "string", message: "string" }. Has optional "children" for action buttons.
- "form": Form container. props: { submitLabel: "string", submitAction: "action_key" }. Has "children" array of input elements.`;

const APP_MODE_PROMPT = `You are MomKidCare AI, an intelligent maternal & child healthcare platform assistant.
You operate in APP MODE — generating full-page dynamic UI layouts.

You MUST respond with ONLY valid JSON (no markdown, no backticks).

Response format:
{
  "message": "Brief status message",
  "page": "current_page_id",
  "ui": [<array of UI component objects>],
  "actions": {<action definitions>},
  "context": {<extracted/updated user context>},
  "sidebar": [<optional sidebar UI components>]
}

${UI_COMPONENTS_SPEC}

## Actions:
{
  "action_key": {
    "type": "api_call"|"navigate"|"collect_input"|"submit_form"|"switch_tab"|"send_message",
    "endpoint": "/api/...",
    "params": {},
    "method": "POST"|"GET",
    "description": "What this action does"
  }
}

## Pages you can generate:
- "onboarding": Onboarding questionnaire flow (multi-step, adaptive questions)
- "home": Dashboard with personalized recommendations, vendor suggestions, health tips
- "recommendations": AI-curated content based on user profile
- "vendors": Nanny, doctor, dietitian, and other vendor listings
- "history": Past interactions and health timeline
- "profile": User profile and settings

## APP MODE Behavior:
1. **Onboarding flow**: Ask progressive questions to build user profile. Start with basics (name, pregnancy stage, child info), then health questions, then preference questions. Each step should adapt based on previous answers.
2. **Home dashboard**: After onboarding, show personalized dashboard with:
   - Health banner with pregnancy/child status
   - Recommended vendors (nannies, doctors, etc.) based on context
   - AI-curated health tips and content cards
   - Quick action buttons
3. **Vendor recommendations**: Show vendorCard components for nannies, doctors, dietitians etc. personalized to user needs. Include ratings, specializations, pricing.
4. **Content recommendations**: Generate health articles, tips, reminders based on pregnancy week or child age.
5. **History**: Show timeline of consultations, health logs, interactions.

## Pregnancy Care Focus:
- Track pregnancy week and adapt all content accordingly
- Trimester-specific recommendations
- Warning signs awareness
- Nutrition and exercise guidance
- Doctor visit scheduling reminders
- Baby development milestones

## Vendor Types to recommend:
- Nanny / babysitter
- OB-GYN / Gynecologist
- Pediatrician
- Lactation consultant
- Dietitian / Nutritionist
- Physiotherapist
- Doula / Birth companion
- Mental health counselor
- Prenatal yoga instructor

## Guidelines:
- Generate RICH, visually appealing layouts using the full component palette
- Use banners, grids, cards extensively for app-like feel
- Always include actionable next steps
- Personalize everything based on user context
- Use warm, healthcare-appropriate tone
- For vendor cards, always include rating, specialization, price, verified status`;

const CHAT_MODE_PROMPT = `You are MomKidCare AI, an intelligent maternal & child healthcare chat assistant.
You operate in CHAT MODE — generating conversational responses with dynamic UI components embedded.

You MUST respond with ONLY valid JSON (no markdown, no backticks).

Response format:
{
  "message": "Empathetic, helpful conversational response",
  "ui": [<array of UI component objects for rich display>],
  "actions": {<action definitions>},
  "context": {<extracted user context>}
}

${UI_COMPONENTS_SPEC}

## Actions:
{
  "action_key": {
    "type": "api_call"|"navigate"|"collect_input"|"send_message",
    "endpoint": "/api/...",
    "params": {},
    "description": "What this action does"
  }
}

## CHAT MODE Behavior:
1. Conversational, empathetic tone
2. Use UI components to enrich responses (stat cards, alerts, lists, vendor cards, etc.)
3. Assess symptom severity and adapt response urgency
4. Recommend vendors/services when relevant
5. Ground advice in knowledge base context
6. Never diagnose — guide and recommend professional consultation
7. For emergency signs → danger alert + emergency button prominently
8. Include actionable buttons (book consultation, find facility, etc.)
9. Remember conversation context across turns`;

async function callGemini(prompt) {
  const response = await axios.post(
    `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
    { contents: [{ parts: [{ text: prompt }] }] }
  );
  return response.data.candidates[0].content.parts[0].text;
}

function parseAIResponse(raw) {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return {
      message: raw,
      ui: [
        {
          type: "container",
          props: { variant: "card", padding: "md" },
          children: [
            { type: "text", props: { variant: "body", content: raw } },
          ],
        },
      ],
      actions: {},
      context: {},
    };
  }
}

async function orchestrate(userMessage, conversationHistory, existingContext, mode = "chat") {
  const ragDocs = await retrieveContext(userMessage);
  const ragContext = formatContextForPrompt(ragDocs);

  const historyText = conversationHistory
    .slice(-8)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const userContextStr = Object.keys(existingContext).length
    ? `\nKnown user context: ${JSON.stringify(existingContext)}`
    : "";

  const systemPrompt = mode === "app" ? APP_MODE_PROMPT : CHAT_MODE_PROMPT;

  const prompt = `${systemPrompt}

## Knowledge Base Context (from RAG):
${ragContext}

## Conversation History:
${historyText || "No prior messages."}
${userContextStr}

## Current User Message:
${userMessage}

Respond with ONLY valid JSON following the response format above.`;

  try {
    const raw = await callGemini(prompt);
    const parsed = parseAIResponse(raw);

    return {
      message: parsed.message || "",
      page: parsed.page || null,
      ui: parsed.ui || [],
      actions: parsed.actions || {},
      context: parsed.context || {},
      sidebar: parsed.sidebar || [],
      ragSources: ragDocs.length,
    };
  } catch (error) {
    console.error("AI Orchestrator error:", error.response?.data || error.message);

    return {
      message: "I'm having trouble processing your request. Please try again.",
      page: null,
      ui: [
        {
          type: "alert",
          props: {
            variant: "warning",
            title: "Service Temporarily Unavailable",
            message: "Our AI service is experiencing issues. Please try again in a moment.",
          },
        },
      ],
      actions: {},
      context: {},
      sidebar: [],
      ragSources: 0,
    };
  }
}

async function generateOnboardingStep(stepNumber, previousAnswers) {
  const prompt = `${APP_MODE_PROMPT}

## Task: Generate onboarding step ${stepNumber}
Previous answers collected: ${JSON.stringify(previousAnswers)}

Generate the NEXT onboarding step. The flow should be:
Step 1: Basic info — name, role (expecting mother / new parent / planning), city
Step 2: Health profile — pregnancy week OR child age (based on step 1), age, blood group
Step 3: Health concerns — current symptoms, conditions, dietary preferences
Step 4: Preferences — what services they need (nanny, doctor, dietitian, etc.), budget range
Step 5: Complete — show summary and personalized welcome dashboard

Use stepIndicator to show progress. Use form with input components for data collection.
Make it feel warm and welcoming. Include a banner at top.

Respond with ONLY valid JSON.`;

  try {
    const raw = await callGemini(prompt);
    return parseAIResponse(raw);
  } catch (error) {
    console.error("Onboarding error:", error.response?.data || error.message);
    return {
      message: "Let's continue setting up your profile.",
      ui: [{ type: "alert", props: { variant: "warning", title: "Error", message: "Please try again." } }],
      actions: {},
      context: {},
    };
  }
}

async function generateHomeDashboard(userProfile, userContext) {
  const ragDocs = await retrieveContext(
    `pregnancy week ${userProfile.pregnancyWeek || ""} ${userProfile.role || "mother"} health tips recommendations`
  );
  const ragContext = formatContextForPrompt(ragDocs);

  const prompt = `${APP_MODE_PROMPT}

## Task: Generate personalized home dashboard
User profile: ${JSON.stringify(userProfile)}
User context: ${JSON.stringify(userContext)}

## Knowledge Base:
${ragContext}

Generate a rich home dashboard with:
1. A warm welcome banner with pregnancy/child status
2. Grid of quick stat metrics (pregnancy week, days to due date, etc.)
3. "Recommended For You" section with vendor cards (nannies, doctors based on their city/needs)
4. Health tips section with cards relevant to their pregnancy week or child age
5. Quick action buttons (book consultation, find nanny, ask AI, track health)
6. Upcoming reminders or checkup timeline if applicable

Make it visually rich with banners, grids, cards, and gradients. This should feel like a premium healthcare app.

Respond with ONLY valid JSON.`;

  try {
    const raw = await callGemini(prompt);
    return parseAIResponse(raw);
  } catch (error) {
    console.error("Dashboard error:", error.response?.data || error.message);
    return {
      message: "Welcome back!",
      ui: [{ type: "alert", props: { variant: "info", title: "Loading...", message: "Preparing your dashboard." } }],
      actions: {},
      context: {},
    };
  }
}

async function generateVendorPage(userProfile, vendorType, vendors) {
  const prompt = `${APP_MODE_PROMPT}

## Task: Generate vendor listing page
User profile: ${JSON.stringify(userProfile)}
Requested vendor type: ${vendorType || "all"}
Available vendors from database: ${JSON.stringify(vendors)}

Generate a vendor listing page with:
1. A banner for the vendor category
2. Filter chips (by specialization, price range, availability)
3. vendorCard components for each vendor with all their details
4. If no vendors found, show emptyState with suggestion to search another category
5. Include "Book Now" action buttons on each vendor card

Respond with ONLY valid JSON.`;

  try {
    const raw = await callGemini(prompt);
    return parseAIResponse(raw);
  } catch (error) {
    console.error("Vendor page error:", error.response?.data || error.message);
    return {
      message: "Here are available vendors.",
      ui: [{ type: "emptyState", props: { icon: "🔍", title: "Loading vendors...", message: "Please wait." } }],
      actions: {},
      context: {},
    };
  }
}

module.exports = { orchestrate, generateOnboardingStep, generateHomeDashboard, generateVendorPage };