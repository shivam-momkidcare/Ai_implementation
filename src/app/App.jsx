import { useState, useRef, useEffect, useCallback } from "react";
import { DynamicRenderer } from "../components/DynamicRenderer";
import * as api from "../services/healthApi";
import "../styles/app.css";

function generateSessionId() {
  return "s_" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

// ─── Auth Screen ────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [isSignup, setIsSignup] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignup) {
        if (!form.name || !form.email) { setError("Name & email required"); setLoading(false); return; }
        const res = await api.signup(form.name, form.email, form.phone);
        if (res.success) onAuth(res.user, !res.isExisting);
        else setError(res.error || "Signup failed");
      } else {
        if (!form.email) { setError("Email required"); setLoading(false); return; }
        const res = await api.login(form.email);
        if (res.success) onAuth(res.user, false);
        else setError(res.error || "Login failed");
      }
    } catch { setError("Server unreachable. Is backend running?"); }
    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🌸 MomKidCare</div>
          <h1 className="auth-title">{isSignup ? "Create Your Account" : "Welcome Back"}</h1>
          <p className="auth-sub">{isSignup ? "Start your personalized healthcare journey" : "Sign in to continue"}</p>
        </div>
        <form className="auth-form" onSubmit={handle}>
          {isSignup && (
            <div className="auth-field">
              <label>Full Name</label>
              <input placeholder="e.g. Priya Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
          )}
          <div className="auth-field">
            <label>Email</label>
            <input type="email" placeholder="priya@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          {isSignup && (
            <div className="auth-field">
              <label>Phone (optional)</label>
              <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          )}
          {error && <div className="auth-error">{error}</div>}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Get Started" : "Sign In"}
          </button>
        </form>
        <div className="auth-switch">
          {isSignup ? "Already have an account?" : "Don't have an account?"}
          <button onClick={() => { setIsSignup(!isSignup); setError(""); }}>
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Chat Mode ──────────────────────────────────────
function ChatMode({ user, sessionId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await api.sendMessage(text, sessionId, "chat");
      setMessages((prev) => [...prev, {
        role: "assistant", content: res.message, ui: res.ui, actions: res.actions, ragSources: res.ragSources,
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant", content: "Sorry, something went wrong.",
        ui: [{ type: "alert", props: { variant: "danger", title: "Error", message: "Could not reach the server." } }], actions: {},
      }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const handleAction = async (actionKey, actionDef) => {
    if (!actionDef) return;
    if (actionDef.type === "navigate" && actionDef.endpoint) { window.open(actionDef.endpoint, "_blank", "noopener"); return; }
    if (actionDef.type === "send_message") {
      setInput(actionDef.params?.message || actionDef.description || "");
      return;
    }
    setLoading(true);
    try {
      const result = await api.executeAction(actionKey, actionDef.params || {});
      setMessages((prev) => [...prev, {
        role: "assistant", content: result.message || "Done.",
        ui: result.data ? [{ type: "container", props: { variant: "success", padding: "md" }, children: [
          { type: "text", props: { variant: "subheading", content: "Action Completed", color: "success" } },
          { type: "text", props: { variant: "body", content: JSON.stringify(result.data, null, 2) } },
        ]}] : [], actions: {},
      }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Action failed.", ui: [], actions: {} }]);
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const quickPrompts = [
    "I'm 28 weeks pregnant and having headaches",
    "What should I eat during second trimester?",
    "Find me a nanny in Delhi",
    "I need to book an OB-GYN consultation",
  ];

  return (
    <div className="chat-mode">
      <div className="chat-area">
        {messages.length === 0 && (
          <div className="welcome">
            <div className="welcome-icon">💬</div>
            <h1 className="welcome-title">Chat with MomKidCare AI</h1>
            <p className="welcome-sub">Ask me anything about pregnancy, baby care, find nannies, book doctors, or get health tips.</p>
            <div className="quick-prompts">
              {quickPrompts.map((p) => (
                <button key={p} className="quick-prompt" onClick={() => setInput(p)}>{p}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`message message--${msg.role}`}>
            {msg.role === "assistant" && <div className="message-avatar">🤖</div>}
            <div className="message-body">
              {msg.content && <div className="message-text">{msg.content}</div>}
              {msg.ui && msg.ui.length > 0 && (
                <div className="message-ui">
                  <DynamicRenderer schema={msg.ui} actions={msg.actions} onAction={handleAction} onInputChange={handleInputChange} formData={formData} />
                </div>
              )}
              {msg.ragSources > 0 && <div className="message-rag">Grounded in {msg.ragSources} source{msg.ragSources > 1 ? "s" : ""}</div>}
            </div>
            {msg.role === "user" && <div className="message-avatar user-avatar">👤</div>}
          </div>
        ))}
        {loading && (
          <div className="message message--assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-body"><div className="typing-indicator"><span></span><span></span><span></span></div></div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="input-area">
        <div className="input-wrapper">
          <textarea className="chat-input" placeholder="Type your message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={1} />
          <button className="send-btn" onClick={handleSend} disabled={!input.trim() || loading}>➤</button>
        </div>
        <div className="input-hint">AI responses are for guidance only. Always consult your healthcare provider.</div>
      </div>
    </div>
  );
}

// ─── App Mode ───────────────────────────────────────
function AppMode({ user, sessionId }) {
  const [page, setPage] = useState(user.onboarded ? "home" : "onboarding");
  const [pageUI, setPageUI] = useState([]);
  const [pageActions, setPageActions] = useState({});
  const [sidebarUI, setSidebarUI] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingAnswers, setOnboardingAnswers] = useState({});

  const loadPage = useCallback(async (pageId) => {
    setLoading(true);
    try {
      let res;
      if (pageId === "home") {
        res = await api.getDashboard(user._id);
      } else if (pageId === "vendors") {
        res = await api.getVendors({ userId: user._id });
      } else if (pageId === "onboarding") {
        res = await api.onboardingStep(user._id, onboardingStep, onboardingAnswers);
      } else {
        res = await api.sendMessage(`Show me the ${pageId} page`, sessionId, "app");
      }
      setPageUI(res.ui || []);
      setPageActions(res.actions || {});
      setSidebarUI(res.sidebar || []);
    } catch {
      setPageUI([{ type: "alert", props: { variant: "danger", title: "Error", message: "Failed to load page." } }]);
    }
    setLoading(false);
  }, [user._id, sessionId, onboardingStep, onboardingAnswers]);

  useEffect(() => { loadPage(page); }, [page, loadPage]);

  const handleAction = async (actionKey, actionDef) => {
    if (!actionDef) return;

    if (actionDef.type === "navigate") {
      if (actionDef.endpoint?.startsWith("/")) {
        const pageId = actionDef.endpoint.replace("/", "");
        setPage(pageId);
      } else if (actionDef.endpoint) {
        window.open(actionDef.endpoint, "_blank", "noopener");
      }
      return;
    }

    if (actionDef.type === "switch_tab") {
      const tabId = actionDef.params?.tabId || actionKey.replace("switch_tab_", "");
      if (tabId === "nanny" || tabId === "doctor" || tabId === "all") {
        setLoading(true);
        const res = await api.getVendors({ userId: user._id, type: tabId === "all" ? undefined : tabId });
        setPageUI(res.ui || []);
        setPageActions(res.actions || {});
        setLoading(false);
      }
      return;
    }

    if (actionDef.type === "submit_form" || actionKey === "next_step") {
      if (page === "onboarding") {
        const newAnswers = { ...onboardingAnswers, ...formData };
        setOnboardingAnswers(newAnswers);
        const nextStep = onboardingStep + 1;
        if (nextStep > 5) {
          await api.updateUser(user._id, { onboarded: true });
          user.onboarded = true;
          setPage("home");
        } else {
          setOnboardingStep(nextStep);
          setLoading(true);
          const res = await api.onboardingStep(user._id, nextStep, newAnswers);
          setPageUI(res.ui || []);
          setPageActions(res.actions || {});
          setLoading(false);
        }
        return;
      }
    }

    if (actionDef.type === "send_message") {
      setLoading(true);
      const res = await api.sendMessage(actionDef.params?.message || actionDef.description, sessionId, "app");
      setPageUI(res.ui || []);
      setPageActions(res.actions || {});
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await api.executeAction(actionKey, actionDef.params || {});
      if (result.success) {
        setPageUI((prev) => [
          { type: "alert", props: { variant: "success", title: "Success", message: result.message } },
          ...prev,
        ]);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleInputChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const navItems = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "vendors", label: "Services", icon: "👥" },
    { id: "history", label: "History", icon: "📋" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  return (
    <div className="app-mode">
      {page !== "onboarding" && (
        <div className="app-sidebar">
          <div className="sidebar-logo">🌸 MomKidCare</div>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button key={item.id} className={`sidebar-item ${page === item.id ? "sidebar-item--active" : ""}`} onClick={() => setPage(item.id)}>
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{user.name?.[0]?.toUpperCase() || "?"}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-email">{user.email}</div>
            </div>
          </div>
        </div>
      )}

      <div className="app-main">
        {page !== "onboarding" && (
          <div className="app-topbar">
            <div className="topbar-title">
              {navItems.find((n) => n.id === page)?.label || page}
            </div>
            <div className="topbar-actions">
              <button className="topbar-btn" onClick={() => loadPage(page)}>↻</button>
            </div>
          </div>
        )}

        <div className="app-content">
          {loading ? (
            <div className="app-loading">
              <div className="app-loading-spinner"></div>
              <div className="app-loading-text">Loading your personalized experience...</div>
            </div>
          ) : (
            <DynamicRenderer schema={pageUI} actions={pageActions} onAction={handleAction} onInputChange={handleInputChange} formData={formData} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Root App ───────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState(null); // null = pick, "chat", "app"
  const [user, setUser] = useState(null);
  const [sessionId] = useState(() => generateSessionId());
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const handleAuth = (u, isNew) => {
    setUser(u);
    setNeedsOnboarding(isNew);
    if (!u.onboarded && mode === "app") setNeedsOnboarding(true);
  };

  // Mode picker
  if (!mode) {
    return (
      <div className="mode-picker">
        <div className="mode-picker__inner">
          <div className="mode-picker__logo">🌸</div>
          <h1 className="mode-picker__title">MomKidCare AI</h1>
          <p className="mode-picker__sub">Your AI-powered maternal & child healthcare companion</p>
          <div className="mode-picker__cards">
            <button className="mode-card mode-card--app" onClick={() => setMode("app")}>
              <div className="mode-card__icon">📱</div>
              <div className="mode-card__title">App Mode</div>
              <div className="mode-card__desc">Full dashboard with personalized recommendations, vendor listings, health tracking & onboarding</div>
            </button>
            <button className="mode-card mode-card--chat" onClick={() => setMode("chat")}>
              <div className="mode-card__icon">💬</div>
              <div className="mode-card__title">Chat Mode</div>
              <div className="mode-card__desc">Quick conversational AI assistant for questions, symptoms, booking & instant help</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // App mode requires auth
  if (mode === "app" && !user) {
    return (
      <div className="app-wrapper">
        <button className="back-to-modes" onClick={() => setMode(null)}>← Back</button>
        <AuthScreen onAuth={handleAuth} />
      </div>
    );
  }

  // Chat mode — no auth required
  if (mode === "chat") {
    return (
      <div className="app">
        <nav className="nav">
          <div className="nav-left">
            <button className="nav-back" onClick={() => setMode(null)}>←</button>
            <div className="nav-logo"><span>💬</span> MomKidCare Chat</div>
          </div>
          <div className="nav-badge">AI Chat Mode</div>
        </nav>
        <ChatMode user={user} sessionId={sessionId} />
      </div>
    );
  }

  // App mode
  return (
    <div className="app app--full">
      <AppMode user={user} sessionId={sessionId} />
      <button className="fab-chat" onClick={() => setMode("chat")} title="Switch to Chat">💬</button>
    </div>
  );
}