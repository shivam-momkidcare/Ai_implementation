export function DForm({ submitLabel = "Submit", submitAction, children, onAction, actions }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitAction && onAction) onAction(submitAction, actions?.[submitAction]);
  };
  return (
    <form className="d-form" onSubmit={handleSubmit}>
      <div className="d-form__fields">{children}</div>
      <button type="submit" className="d-form__submit">{submitLabel}</button>
    </form>
  );
}
