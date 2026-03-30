export function DStepIndicator({ steps = [] }) {
  return (
    <div className="d-steps">
      {steps.map((step, i) => (
        <div key={i} className={`d-steps__item d-steps__item--${step.status || "upcoming"}`}>
          <div className="d-steps__circle">
            {step.status === "completed" ? "✓" : i + 1}
          </div>
          <div className="d-steps__label">{step.label}</div>
          {i < steps.length - 1 && <div className="d-steps__line" />}
        </div>
      ))}
    </div>
  );
}
