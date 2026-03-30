export function DButton({ label, action, variant = "primary", icon, size = "md", fullWidth, onAction, actions }) {
  const handleClick = () => {
    if (action && onAction) {
      onAction(action, actions?.[action]);
    }
  };

  return (
    <button
      className={`d-button d-button--${variant} d-button--${size} ${fullWidth ? "d-button--full" : ""}`}
      onClick={handleClick}
    >
      {icon && <span className="d-button__icon">{icon}</span>}
      {label}
    </button>
  );
}
