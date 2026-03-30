export function DText({ variant = "body", content = "", color = "default" }) {
  const Tag = variant === "hero" ? "h1" : variant === "heading" ? "h2" : variant === "subheading" ? "h3" : "p";
  return (
    <Tag className={`d-text d-text--${variant} d-text--${color}`}>
      {content}
    </Tag>
  );
}
