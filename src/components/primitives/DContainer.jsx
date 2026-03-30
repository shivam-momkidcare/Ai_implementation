export function DContainer({ variant = "card", padding = "md", children }) {
  return (
    <div className={`d-container d-container--${variant} d-container--pad-${padding}`}>
      {children}
    </div>
  );
}
