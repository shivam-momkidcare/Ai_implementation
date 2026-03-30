export function DList({ variant = "bullet", items = [] }) {
  if (variant === "numbered") {
    return (
      <ol className="d-list d-list--numbered">
        {items.map((item, i) => (
          <li key={i} className="d-list__item">{item}</li>
        ))}
      </ol>
    );
  }

  if (variant === "checklist") {
    return (
      <ul className="d-list d-list--checklist">
        {items.map((item, i) => (
          <li key={i} className="d-list__item">
            <span className="d-list__check">&#10003;</span>
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="d-list d-list--bullet">
      {items.map((item, i) => (
        <li key={i} className="d-list__item">{item}</li>
      ))}
    </ul>
  );
}
