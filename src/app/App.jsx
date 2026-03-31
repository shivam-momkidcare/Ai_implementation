import { useEffect, useState } from "react";
import { INITIAL_FORM, SYMPTOMS, babySizeLabel, trimesterLabel } from "../features/health/constants";
import { createHealthLog, fetchHealthHistory, mapAdviceFromAi, askAI } from "../services/healthApi";
import "../styles/app.css";
import { searchHealthLogs } from "../services/healthApi";

export default function App() {
  const [tab, setTab] = useState("home");
  const [form, setForm] = useState(INITIAL_FORM);
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiSections, setAiSections] = useState(null);
  const [aiRecords, setAiRecords] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      try {
        const data = await fetchHealthHistory();
        console.log("Fetched history:", data);
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
        name: form.name,
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

  const handleSearch = async () => {
    if (!searchQuery) return;

    setSearchLoading(true);
    setSearchError("");
    setSearchResults([]);
    setIsSearching(true);

    try {
      const res = await searchHealthLogs(searchQuery);

      if (res.success) {
        if (res.results.length === 0) {
          setSearchError("No similar records found 😔");
        } else {
          setSearchResults(res.results);
        }
      } else {
        setSearchError("Search failed. Try again.");
      }
    } catch (err) {
      console.error("Search API error:", err);
      setSearchError("Server error. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
    setIsSearching(false);
  };

  const handleAiAsk = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiSections(null);
    setAiRecords([]);
    setAiError("");
    try {
      const res = await askAI(aiQuery);
      if (res.success) {
        setAiSections(res.answer?.sections || []);
        setAiRecords(res.matchedRecords || []);
      } else {
        setAiError(res.error || "Something went wrong.");
      }
    } catch (err) {
      console.error("AI Ask error:", err);
      setAiError("Server error. Please try again.");
    } finally {
      setAiLoading(false);
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
        {[["home", "🏠 Home"], ["track", "📋 Track Today"], ["advice", "✨ AI Advice"], ["insights", "🧠 AI Insights"], ["history", "📅 History"]].map(([id, label]) => (
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

      {tab === "insights" && (
        <div className="page">
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "22px", fontWeight: 700, marginBottom: "16px" }}>
            🧠 AI Health Insights
          </div>

          <div className="card">
            <div className="card-title"><span className="icon">💬</span> Ask AI</div>
            <div className="search-box">
              <input
                placeholder="e.g. What should I do about high BP in week 20?"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiAsk()}
              />
              <button onClick={handleAiAsk} disabled={aiLoading}>
                {aiLoading ? "..." : "Ask"}
              </button>
            </div>
          </div>

          {aiLoading && (
            <div className="loading-wrap">
              <div className="loading-petals">🧠</div>
              <div className="loading-text">AI is analysing your records…</div>
            </div>
          )}

          {aiError && (
            <div className="empty-wrap">
              <div className="empty-icon">😔</div>
              <div className="empty-title">Oops</div>
              <div className="empty-sub">{aiError}</div>
            </div>
          )}

          {/* Dynamic renderer based on section count */}
          {aiSections && aiSections.length > 0 && (
            <>
              {aiSections.length <= 2 ? (
                /* CARDS layout for 1-2 sections */
                <div className="ai-cards-single">
                  {aiSections.map((sec, i) => (
                    <div key={i} className={`advice-card ${sec.type}`} style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="advice-header">
                        <div className={`advice-icon ${sec.type}`}>{sec.icon}</div>
                        <div>
                          <div className="advice-title">{sec.title}</div>
                          <div className="advice-sub">{sec.type}</div>
                        </div>
                      </div>
                      <div className="advice-items">
                        {sec.items.map((item, j) => <div key={j} className="advice-item">{item}</div>)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : aiSections.length <= 4 ? (
                /* 2-column GRID for 3-4 sections */
                <div className="ai-cards-grid">
                  {aiSections.map((sec, i) => (
                    <div key={i} className={`advice-card ${sec.type}`} style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="advice-header">
                        <div className={`advice-icon ${sec.type}`}>{sec.icon}</div>
                        <div>
                          <div className="advice-title">{sec.title}</div>
                          <div className="advice-sub">{sec.type}</div>
                        </div>
                      </div>
                      <div className="advice-items">
                        {sec.items.map((item, j) => <div key={j} className="advice-item">{item}</div>)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* TABLE layout for 5+ sections */
                <div className="card ai-table-wrap">
                  <div className="card-title"><span className="icon">📊</span> Detailed Analysis</div>
                  <div className="ai-table-scroll">
                    <table className="ai-table">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Section</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiSections.map((sec, i) => (
                          <tr key={i}>
                            <td className="ai-table-icon">{sec.icon}</td>
                            <td className="ai-table-title">
                              <strong>{sec.title}</strong>
                              <span className={`ai-type-badge ${sec.type}`}>{sec.type}</span>
                            </td>
                            <td>
                              <ul className="ai-table-items">
                                {sec.items.map((item, j) => <li key={j}>{item}</li>)}
                              </ul>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Matched Records */}
              {aiRecords.length > 0 && (
                <div className="card" style={{ marginTop: "16px" }}>
                  <div className="card-title"><span className="icon">📋</span> Matched Records ({aiRecords.length})</div>
                  {aiRecords.map((rec, i) => (
                    <div key={i} className="history-item" onClick={() => {
                      setForm({
                        name: rec.name || "", age: String(rec.age || ""), week: String(rec.week || "20"),
                        weight: String(rec.weight || ""), bp: String(rec.vitals?.bp || "120"),
                        sugar: String(rec.vitals?.sugar || "90"), hb: String(rec.vitals?.hb || "11.5"),
                        symptoms: rec.symptoms || [], diet: rec.diet || "", activity: rec.activity || "",
                      });
                      setAdvice(mapAdviceFromAi(rec.aiAdvice));
                      setTab("advice");
                    }}>
                      <div>
                        <div className="history-name">{rec.name}</div>
                        <div className="history-meta">
                          Week {rec.week} · BP {rec.vitals?.bp} · Sugar {rec.vitals?.sugar}
                          {rec.score != null && ` · Match ${Math.round(rec.score * 100)}%`}
                        </div>
                      </div>
                      <span className="week-badge">Wk {rec.week}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="submit-btn"
                style={{ marginTop: "16px", background: "linear-gradient(135deg,#8aab94,#5a876a)" }}
                onClick={() => { setAiSections(null); setAiRecords([]); setAiQuery(""); setAiError(""); }}
              >
                🔄 Ask Another Question
              </button>
            </>
          )}

          {!aiLoading && !aiSections && !aiError && (
            <div className="empty-wrap">
              <div className="empty-icon">🧠</div>
              <div className="empty-title">Ask AI anything</div>
              <div className="empty-sub">Ask about your health data — e.g. "Am I at risk for gestational diabetes?" or "Tips for week 28 fatigue"</div>
            </div>
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="page">

          {/* Title */}
          <div style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "22px",
            fontWeight: 700,
            marginBottom: "16px"
          }}>
            Health History
          </div>

          {/* 🔍 Smart Search Card */}
          <div className="card search-card">
            <div className="card-title">
              <span className="icon">🔍</span> Smart Search
            </div>

            <div className="search-box">
              <input
                placeholder="Search like: high BP, sugar issue, fatigue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <button onClick={handleSearch}>
                {searchLoading ? "..." : "Search"}
              </button>
            </div>
          </div>

          {/* 🔥 AI Results */}
          {searchLoading && (
            <div className="loading-text" style={{ marginBottom: "10px" }}>
              Searching smart matches...
            </div>
          )}

          {/* {searchResults.length > 0 && (
            <div className="card">
              <div className="card-title">🔥 AI Matched Results</div>

              {searchResults.map((item, index) => (
                <div
                  key={index}
                  className="history-item search-result"
                  onClick={() => {
                    setForm({
                      name: item.name,
                      week: item.week,
                      symptoms: item.symptoms,
                      bp: item.vitals?.bp,
                      sugar: item.vitals?.sugar,
                      hb: item.vitals?.hb,
                    });

                    const mapped = mapAdviceFromAi(item.aiAdvice);
                    setAdvice(mapped);
                    setTab("advice");
                  }}
                >
                  <div>
                    <div className="history-name">{item.name}</div>
                    <div className="history-meta">
                      Week {item.week} · Match {Math.round(item.score * 100)}%
                    </div>
                  </div>

                  <div className="match-badge">
                    🔥
                  </div>
                </div>
              ))}
            </div>
          )} */}

          {/* 📅 Normal History */}
          {/* 🔍 SEARCH MODE */}
          {isSearching ? (
            <>
              {searchLoading && (
                <div className="loading-text" style={{ marginBottom: "10px" }}>
                  Searching smart matches...
                </div>
              )}

              {!searchLoading && searchError && (
                <div className="empty-wrap">
                  <div className="empty-icon">🔍</div>
                  <div className="empty-title">No Results Found</div>
                  <div className="empty-sub">{searchError}</div>
                </div>
              )}

              {!searchLoading && searchResults.length > 0 && (
                <div className="card">
                  <div className="card-title">🔥 AI Matched Results</div>

                  {searchResults.map((item, index) => (
                    <div
                      key={index}
                      className="history-item search-result"
                      onClick={() => {
                        setForm({
                          name: item.name,
                          week: item.week,
                          symptoms: item.symptoms,
                          bp: item.vitals?.bp,
                          sugar: item.vitals?.sugar,
                          hb: item.vitals?.hb,
                        });

                        const mapped = mapAdviceFromAi(item.aiAdvice);
                        setAdvice(mapped);
                        setTab("advice");
                      }}
                    >
                      <div>
                        <div className="history-name">{item.name}</div>
                        <div className="history-meta">
                          Week {item.week} · Match {Math.round((item.score || 0) * 100)}%
                        </div>
                      </div>

                      <div className="match-badge">🔥</div>
                    </div>
                  ))}
                </div>
              )}

              {/* ❌ Clear Search */}
              <button
                className="submit-btn"
                style={{ marginTop: "10px", background: "#e85050" }}
                onClick={clearSearch}
              >
                ❌ Clear Search
              </button>
            </>
          ) : (
            <>
              {/* 📅 DEFAULT HISTORY */}
              {history.length === 0 ? (
                <div className="empty-wrap">
                  <div className="empty-icon">📅</div>
                  <div className="empty-title">No entries yet</div>
                  <div className="empty-sub">
                    Your tracked sessions will appear here.
                  </div>
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
                      <div className="history-name">{entry.name}</div>
                      <div className="history-date">{entry.date}</div>
                      <div className="history-meta">
                        Week {entry.week} · {entry.symptoms} symptoms
                      </div>
                    </div>

                    <span className="week-badge">Wk {entry.week}</span>
                  </div>
                ))
              )}
            </>
          )}

        </div>
      )}
    </div>
  );
}