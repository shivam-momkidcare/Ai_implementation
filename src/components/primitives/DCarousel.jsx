export function DCarousel({ children }) {
  return (
    <div className="d-carousel">
      <div className="d-carousel__track">
        {children}
      </div>
    </div>
  );
}
