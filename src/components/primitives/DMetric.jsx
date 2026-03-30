export function DMetric({ value, label, icon, color = "accent", subtitle }) {
  return (
    <div className={`d-metric d-metric--${color}`}>
      {icon && <div className="d-metric__icon">{icon}</div>}
      <div className="d-metric__value">{value}</div>
      <div className="d-metric__label">{label}</div>
      {subtitle && <div className="d-metric__subtitle">{subtitle}</div>}
    </div>
  );
}
