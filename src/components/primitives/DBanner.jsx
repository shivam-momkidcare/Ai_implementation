export function DBanner({ title, subtitle, gradient = "pink", icon, children }) {
  return (
    <div className={`d-banner d-banner--${gradient}`}>
      <div className="d-banner__content">
        {icon && <div className="d-banner__icon">{icon}</div>}
        <div>
          {title && <div className="d-banner__title">{title}</div>}
          {subtitle && <div className="d-banner__subtitle">{subtitle}</div>}
        </div>
      </div>
      {children && <div className="d-banner__actions">{children}</div>}
    </div>
  );
}
