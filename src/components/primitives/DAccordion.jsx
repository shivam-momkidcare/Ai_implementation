import { useState } from "react";

export function DAccordion({ title, content, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`d-accordion ${open ? "d-accordion--open" : ""}`}>
      <button className="d-accordion__header" onClick={() => setOpen(!open)}>
        <span className="d-accordion__title">{title}</span>
        <span className="d-accordion__arrow">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="d-accordion__body">{content}</div>}
    </div>
  );
}
