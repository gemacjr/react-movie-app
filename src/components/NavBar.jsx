import { Link } from "react-router-dom";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import "../css/NavBar.css";

function NavBar() {
  // WHY useOnlineStatus: surface connectivity before the user wonders why
  // search/favorites feel broken. Coarse signal — not a substitute for
  // proper error handling on fetch.
  const online = useOnlineStatus();

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/" className="navbar-link">
            Movie App
          </Link>
        </div>
        <div className="navbar-links">
          <Link to="/" className="navbar-link">
            Home
          </Link>
          <Link to="/favorites" className="navbar-link">
            Favorites
          </Link>
        </div>
      </nav>
      {!online && (
        <div className="offline-banner" role="status">
          You appear to be offline. Search and new data may fail until you
          reconnect.
        </div>
      )}
    </>
  );
}

export default NavBar;
