export function DTimeline({ items = [] }) {
  return (
    <div className="d-timeline">
      {items.map((item, i) => (
        <div key={i} className={`d-timeline__item d-timeline__item--${item.status || "upcoming"}`}>
          <div className="d-timeline__dot">
            {item.icon || (item.status === "completed" ? "✓" : item.status === "current" ? "●" : "○")}
          </div>
          <div className="d-timeline__content">
            <div className="d-timeline__title">{item.title}</div>
            {item.description && <div className="d-timeline__desc">{item.description}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
