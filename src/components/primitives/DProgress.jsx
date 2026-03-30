export function DProgress({ label, value = 0, color = "default" }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="d-progress">
      {label && <div className="d-progress__label">{label}</div>}
      <div className="d-progress__track">
        <div
          className={`d-progress__fill d-progress__fill--${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <div className="d-progress__value">{clamped}%</div>
    </div>
  );
}
