export function DStat({ label, value, icon, trend }) {
  return (
    <div className="d-stat">
      {icon && <div className="d-stat__icon">{icon}</div>}
      <div className="d-stat__value">{value}</div>
      <div className="d-stat__label">{label}</div>
      {trend && (
        <div className={`d-stat__trend d-stat__trend--${trend}`}>
          {trend === "up" ? "\u2191" : trend === "down" ? "\u2193" : "\u2192"}
        </div>
      )}
    </div>
  );
}
