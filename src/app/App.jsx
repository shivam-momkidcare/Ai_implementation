import { useEffect, useState } from "react";
import { INITIAL_FORM, SYMPTOMS, babySizeLabel, trimesterLabel } from "../features/health/constants";
import { createHealthLog, fetchHealthHistory, mapAdviceFromAi } from "../services/healthApi";
import "../styles/app.css";

export default function App() {
  const [tab, setTab] = useState("home");
  const [form, setForm] = useState(INITIAL_FORM);
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      try {
        const data = await fetchHealthHistory();
        if (active && data.length > 0) {
          setHistory(data);
        }
      } catch (error) {
        console.error("History fetch error:", error);
      }
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, []);

  const set = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const toggleSymptom = (symptom) => {
    setForm((previous) => ({
      ...previous,
      symptoms: previous.symptoms.includes(symptom)
        ? previous.symptoms.filter((item) => item !== symptom)
        : [...previous.symptoms, symptom],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setAdvice(null);
    setTab("advice");

    try {
      const response = await createHealthLog(form);
      console.log("API response:", response);

      if (!response.success) {
        alert("Server returned an error. Check console.");
        console.error("Server error:", response);
        return;
      }

      const mappedAdvice = mapAdviceFromAi(response.log.aiAdvice);
      setAdvice(mappedAdvice);

      const entry = {
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        week: form.week,
        symptoms: form.symptoms.length,
        data: { ...form },
        advice: mappedAdvice,
      };

      setHistory((previous) => [entry, ...previous]);
    } catch (error) {
      console.error("API error:", error);
      alert("Something went wrong. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const week = parseInt(form.week, 10) || 20;
  const progress = Math.round((week / 40) * 100);
  const circumference = 2 * Math.PI * 38;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-logo"><span>🌸</span> MamaAI</div>
        <div className="nav-week">Week {form.week || "—"} · {trimesterLabel(week)}</div>
      </nav>

      <div className="tabs">
        {[["home", "🏠 Home"], ["track", "📋 Track Today"], ["advice", "✨ AI Advice"], ["history", "📅 History"]].map(([id, label]) => (
          <button key={id} className={`tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === "home" && (
        <div className="page">
          <div className="card hero-card">
            <div className="ring-wrap">
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle className="ring-bg" cx="45" cy="45" r="38" />
                <circle
                  className="ring-fill"
                  cx="45"
                  cy="45"
                  r="38"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="ring-center">
                <div className="ring-week">{form.week}</div>
                <div className="ring-label">WEEKS</div>
              </div>
            </div>
            <div className="hero-info">
              <h2>{form.name ? `Hello, ${form.name}! 🌸` : "Welcome, Mama! 🌸"}</h2>
              <p>Your baby is about the size of <strong>{babySizeLabel(week)}</strong>.</p>
              <div className="tri"><span className="tri-badge">{trimesterLabel(week)} · {progress}% complete</span></div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            {[
              {
                label: "Blood Pressure",
                val: `${form.bp}`,
                unit: "mmHg",
                icon: "❤️",
                color: parseInt(form.bp, 10) > 140 ? "#e85050" : parseInt(form.bp, 10) > 130 ? "#d4a853" : "#8aab94",
              },
              {
                label: "Blood Sugar",
                val: `${form.sugar}`,
                unit: "mg/dL",
                icon: "🩸",
                color: parseInt(form.sugar, 10) > 140 ? "#e85050" : parseInt(form.sugar, 10) > 110 ? "#d4a853" : "#8aab94",
              },
              {
                label: "Hemoglobin",
                val: `${form.hb}`,
                unit: "g/dL",
                icon: "💉",
                color: parseFloat(form.hb) < 10 ? "#e85050" : parseFloat(form.hb) < 11 ? "#d4a853" : "#8aab94",
              },
            ].map((stat) => (
              <div key={stat.label} className="card" style={{ padding: "14px", textAlign: "center", marginBottom: 0 }}>
                <div style={{ fontSize: "22px", marginBottom: "4px" }}>{stat.icon}</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "18px", fontWeight: 700, color: stat.color }}>{stat.val}</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{stat.unit}</div>
                <div style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--text-soft)", marginTop: "4px" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {form.symptoms.length > 0 && (
            <div className="card">
              <div className="card-title"><span className="icon">😔</span> Today&apos;s Symptoms</div>
              <div className="symptom-grid">
                {form.symptoms.map((symptom) => <span key={symptom} className="sym-tag on">{symptom}</span>)}
              </div>
            </div>
          )}

          <button className="submit-btn" onClick={() => setTab("track")}>
            📋 Log Today&apos;s Health
          </button>
        </div>
      )}

      {tab === "track" && (
        <div className="page">
          <div className="card">
            <div className="card-title"><span className="icon">👤</span> Basic Information</div>
            <div className="form-grid">
              <div className="field">
                <label>Your Name</label>
                <input placeholder="e.g. Priya" value={form.name} onChange={(event) => set("name", event.target.value)} />
              </div>
              <div className="field">
                <label>Age</label>
                <input type="number" placeholder="e.g. 28" value={form.age} onChange={(event) => set("age", event.target.value)} />
              </div>
              <div className="field">
                <label>Pregnancy Week</label>
                <input type="number" min="1" max="42" placeholder="e.g. 20" value={form.week} onChange={(event) => set("week", event.target.value)} />
              </div>
              <div className="field">
                <label>Weight (kg)</label>
                <input type="number" placeholder="e.g. 65" value={form.weight} onChange={(event) => set("weight", event.target.value)} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title"><span className="icon">🌡️</span> Symptoms Today</div>
            <div className="symptom-grid">
              {SYMPTOMS.map((symptom) => (
                <span
                  key={symptom}
                  className={`sym-tag ${form.symptoms.includes(symptom) ? "on" : ""}`}
                  onClick={() => toggleSymptom(symptom)}
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title"><span className="icon">📊</span> Vitals</div>
            {[
              { key: "bp", label: "Blood Pressure (mmHg)", min: 80, max: 180, step: 1 },
              { key: "sugar", label: "Blood Sugar (mg/dL)", min: 60, max: 250, step: 1 },
              { key: "hb", label: "Hemoglobin (g/dL)", min: 7, max: 16, step: 0.1 },
            ].map((vital) => (
              <div key={vital.key} className="vital-row">
                <div className="vital-label">{vital.label}</div>
                <input
                  type="range"
                  min={vital.min}
                  max={vital.max}
                  step={vital.step}
                  value={form[vital.key]}
                  onChange={(event) => set(vital.key, event.target.value)}
                />
                <div className="vital-val">{form[vital.key]}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title"><span className="icon">🥦</span> Diet & Lifestyle</div>
            <div className="form-grid full">
              <div className="field">
                <label>What did you eat today?</label>
                <input placeholder="e.g. dal rice, fruits, milk" value={form.diet} onChange={(event) => set("diet", event.target.value)} />
              </div>
              <div className="field">
                <label>Physical Activity</label>
                <select value={form.activity} onChange={(event) => set("activity", event.target.value)}>
                  <option value="">Select activity level</option>
                  <option value="none">None / Bed rest</option>
                  <option value="light">Light (short walk)</option>
                  <option value="moderate">Moderate (yoga / swim)</option>
                  <option value="active">Active (gym / brisk walk)</option>
                </select>
              </div>
            </div>
          </div>

          <button className="submit-btn" onClick={handleSubmit}>
            ✨ Get AI Health Advice
          </button>
        </div>
      )}

      {tab === "advice" && (
        <div className="page">
          {loading ? (
            <div className="loading-wrap">
              <div className="loading-petals">🌸</div>
              <div className="loading-text">Personalising your health advice…</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Analysing week {form.week} data</div>
            </div>
          ) : advice ? (
            <div className="advice-section">
              <div style={{ marginBottom: "4px" }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "22px", fontWeight: 700, color: "var(--text)" }}>Your Health Insights</div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>Week {form.week} · {trimesterLabel(week)}</div>
              </div>
              {advice.map((item, index) => (
                <div key={item.type} className={`advice-card ${item.type}`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="advice-header">
                    <div className={`advice-icon ${item.type}`}>{item.icon}</div>
                    <div>
                      <div className="advice-title">{item.title}</div>
                      <div className="advice-sub">
                        {item.type === "nutrition"
                          ? "Personalised for your vitals"
                          : item.type === "exercise"
                          ? "Safe for your trimester"
                          : item.type === "warning"
                          ? "Based on your readings"
                          : "Upcoming milestones"}
                      </div>
                    </div>
                  </div>
                  <div className="advice-items">
                    {item.items.map((line, lineIndex) => <div key={lineIndex} className="advice-item">{line}</div>)}
                  </div>
                </div>
              ))}
              <button className="submit-btn" style={{ background: "linear-gradient(135deg,#8aab94,#5a876a)" }} onClick={() => setTab("track")}>
                🔄 Update Today&apos;s Data
              </button>
            </div>
          ) : (
            <div className="empty-wrap">
              <div className="empty-icon">🌷</div>
              <div className="empty-title">No advice yet</div>
              <div className="empty-sub">Log your health data on the Track tab to receive personalised AI recommendations.</div>
              <button className="submit-btn" style={{ marginTop: "8px", maxWidth: "260px" }} onClick={() => setTab("track")}>
                📋 Start Tracking
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="page">
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "22px", fontWeight: 700, marginBottom: "20px" }}>Health History</div>
          {history.length === 0 ? (
            <div className="empty-wrap">
              <div className="empty-icon">📅</div>
              <div className="empty-title">No entries yet</div>
              <div className="empty-sub">Your tracked sessions will appear here after your first log.</div>
            </div>
          ) : (
            history.map((entry, index) => (
              <div
                key={index}
                className="history-item"
                onClick={() => {
                  setForm(entry.data);
                  setAdvice(entry.advice);
                  setTab("advice");
                }}
              >
                <div>
                  <div className="history-date">{entry.date}</div>
                  <div className="history-meta">Week {entry.week} · {entry.symptoms} symptom{entry.symptoms !== 1 ? "s" : ""} logged</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="week-badge">Wk {entry.week}</span>
                  <span className="history-arrow">›</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
