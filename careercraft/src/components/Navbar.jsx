
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    closeMenu();
    logout();

    navigate("/login", {
      replace: true,
      state: { message: "You have logged out successfully." },
    });
  }

  function getNavLinkClass({ isActive }) {
    return `nav-link${isActive ? " active" : ""}`;
  }

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-icon" aria-hidden="true">
            C
          </span>

          <span className="brand-name">
            CareerCraft<span className="brand-pk"> PK</span>
          </span>
        </Link>

        <button
          type="button"
          className={`navbar-toggle${menuOpen ? " is-open" : ""}`}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <div
          id="primary-navigation"
          className={`navbar-content${menuOpen ? " menu-open" : ""}`}
        >
          <nav className="navbar-links" aria-label="Main navigation">
            <NavLink to="/" end className={getNavLinkClass} onClick={closeMenu}>
              Home
            </NavLink>

            <a
              href="/#how-it-works"
              className="nav-link"
              onClick={closeMenu}
            >
              How It Works
            </a>

            <a
              href="/#career-tools"
              className="nav-link"
              onClick={closeMenu}
            >
              Career Tools
            </a>

            <NavLink
              to="/careers"
              className={getNavLinkClass}
              onClick={closeMenu}
            >
              Explore Careers
            </NavLink>

            <NavLink
              to="/job-analyzer"
              className={getNavLinkClass}
              onClick={closeMenu}
            >
              Job Analyzer
            </NavLink>

            {!loading && user && (
              <NavLink
                to="/cv-generator"
                className={getNavLinkClass}
                onClick={closeMenu}
              >
                CV Builder
              </NavLink>
            )}
          </nav>

          {!loading && (
            <div className="navbar-actions">
              {user ? (
                <>
                  <div className="navbar-user">
                    <span className="user-avatar" aria-hidden="true">
                      {(user.full_name || "U").trim().charAt(0).toUpperCase()}
                    </span>

                    <span className="user-greeting">
                      <span className="user-greeting-label">Welcome back</span>
                      <span className="user-name">
                        {user.full_name || "User"}
                      </span>
                    </span>
                  </div>

                  <NavLink
                    to="/dashboard"
                    className={getNavLinkClass}
                    onClick={closeMenu}
                  >
                    Dashboard
                  </NavLink>

                  <NavLink
                    to="/profile"
                    className={getNavLinkClass}
                    onClick={closeMenu}
                  >
                    My Profile
                  </NavLink>

                  <button
                    type="button"
                    className="nav-logout"
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="nav-login"
                    onClick={closeMenu}
                  >
                    Log In
                  </Link>

                  <Link
                    to="/register"
                    className="nav-get-started"
                    onClick={closeMenu}
                  >
                    Get Started
                    <span aria-hidden="true"> →</span>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
