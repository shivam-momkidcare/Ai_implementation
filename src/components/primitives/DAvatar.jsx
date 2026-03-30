export function DAvatar({ name = "", src, size = "md" }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={`d-avatar d-avatar--${size}`}>
      {src ? <img src={src} alt={name} /> : <span>{initials || "?"}</span>}
    </div>
  );
}
