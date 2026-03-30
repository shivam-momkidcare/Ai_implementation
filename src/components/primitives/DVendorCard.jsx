export function DVendorCard({ name, type, rating, experience, price, specializations = [], verified, avatar, action, onAction, actions }) {
  const handleBook = () => {
    if (action && onAction) onAction(action, actions?.[action]);
  };
  return (
    <div className="d-vendor-card">
      <div className="d-vendor-card__header">
        <div className="d-vendor-card__avatar">{avatar || "👤"}</div>
        <div className="d-vendor-card__info">
          <div className="d-vendor-card__name">
            {name}
            {verified && <span className="d-vendor-card__verified" title="Verified">✓</span>}
          </div>
          <div className="d-vendor-card__type">{type}</div>
        </div>
        <div className="d-vendor-card__rating">
          <span className="d-vendor-card__star">★</span> {rating || "—"}
        </div>
      </div>
      {specializations.length > 0 && (
        <div className="d-vendor-card__tags">
          {specializations.map((s, i) => <span key={i} className="d-vendor-card__tag">{s}</span>)}
        </div>
      )}
      <div className="d-vendor-card__footer">
        <div className="d-vendor-card__meta">
          {experience && <span>{experience}</span>}
          {price && <span className="d-vendor-card__price">{price}</span>}
        </div>
        {action && (
          <button className="d-vendor-card__book" onClick={handleBook}>Book</button>
        )}
      </div>
    </div>
  );
}
