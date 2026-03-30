export function DChip({ label, selected, action, onAction, actions }) {
  const handleClick = () => {
    if (action && onAction) onAction(action, actions?.[action]);
  };
  return (
    <button className={`d-chip ${selected ? "d-chip--selected" : ""}`} onClick={handleClick}>
      {label}
    </button>
  );
}
