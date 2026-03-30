export function DAlert({ variant = "info", title, message }) {
  return (
    <div className={`d-alert d-alert--${variant}`}>
      {title && <div className="d-alert__title">{title}</div>}
      {message && <div className="d-alert__message">{message}</div>}
    </div>
  );
}
