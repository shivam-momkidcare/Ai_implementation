export function DEmptyState({ icon, title, message, children }) {
  return (
    <div className="d-empty">
      {icon && <div className="d-empty__icon">{icon}</div>}
      {title && <div className="d-empty__title">{title}</div>}
      {message && <div className="d-empty__message">{message}</div>}
      {children && <div className="d-empty__actions">{children}</div>}
    </div>
  );
}
