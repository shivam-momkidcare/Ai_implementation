export function DBadge({ label, variant = "default" }) {
  return <span className={`d-badge d-badge--${variant}`}>{label}</span>;
}
