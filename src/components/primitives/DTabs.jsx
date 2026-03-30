export function DTabs({ items = [], activeTab, children, onAction, actions }) {
  return (
    <div className="d-tabs">
      <div className="d-tabs__header">
        {items.map((tab) => (
          <button
            key={tab.id}
            className={`d-tabs__tab ${activeTab === tab.id ? "d-tabs__tab--active" : ""}`}
            onClick={() => onAction && onAction(`switch_tab_${tab.id}`, actions?.[`switch_tab_${tab.id}`])}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="d-tabs__content">{children}</div>
    </div>
  );
}
