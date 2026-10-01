import "../css/Fallback.css";

export default function PageFallback({ label = "Loading..." }) {
  return (
    <div className="page-fallback" role="status">
      {label}
    </div>
  );
}
