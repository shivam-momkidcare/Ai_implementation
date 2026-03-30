export function DGrid({ columns = 2, children }) {
  return (
    <div className="d-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {children}
    </div>
  );
}
