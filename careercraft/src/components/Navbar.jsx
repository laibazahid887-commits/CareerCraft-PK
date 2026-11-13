
import { useState } from "react";
import {
  Link,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

// Service icons (inline SVG — no extra package required)
const serviceIcons = {
  job: (
    <>
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18M10 12v2h4v-2" />
    </>
  ),
  cv: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" />
      <circle cx="10" cy="10" r="1" />
    </>
  ),
  ats: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4.5 4.5M8 10h5M8 13h3" />
      <path d="M8 7h5" />
    </>
  ),
  interview: (
    <>
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
      <path d="M8 11h8M8 14h5" />
    </>
  ),
  skills: (
    <>
      <path d="M3 3v18h18" />
      <path d="m7 14 4-4 4 3 6-7" />
      <path d="M16 6h5v5" />
    </>
  ),
  roadmap: (
    <>
      <circle cx="5" cy="5" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="M5 7v3a4 4 0 0 0 4 4h6a4 4 0 0 1 4 4" />
      <path d="M15 18l4 4 4-4" />
    </>
  ),
  tracker: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 3.5h6M8 10l2 2 5-5M8 16h8" />
    </>
  ),
};

function ServiceIcon({ type }) {
  return (
    <span className="service-link-icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {serviceIcons[type]}
      </svg>
    </span>
  );
}

function Navbar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const services = [
    {
      title: "Job Analyzer",
      description: "Analyze job descriptions and requirements",
      path: "/job-analyzer",
      icon: "job",
    },
    {
      title: "CV Builder",
      description: "Create a professional CV",
      path: "/cv-generator",
      icon: "cv",
    },
    {
      title: "ATS Resume Analyzer",
      description: "Check your resume for ATS compatibility",
      path: "/resume-analyzer",
      icon: "ats",
    },
    {
      title: "Interview Preparation",
      description: "Prepare for technical and HR interviews",
      path: "/interview-preparation",
      icon: "interview",
    },
    {
      title: "Skill Gap Analyzer",
      description: "Identify skills you need to improve",
      path: "/skill-gap",
      icon: "skills",
    },
    {
      title: "Career Roadmap",
      description: "Explore your career development path",
      path: "/roadmap",
      icon: "roadmap",
    },
    {
      title: "Job Application Tracker",
      description: "Organize and track your applications",
      path: "/job-applications",
      icon: "tracker",
    },
  ];

  const isServicesActive = services.some(
    (service) =>
      location.pathname === service.path ||
      location.pathname.startsWith(`${service.path}/`)
  );

  function closeMenu() {
    setMenuOpen(false);
    setServicesOpen(false);
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

  function handleServicesKeyDown(event) {
    if (event.key === "Escape") {
      setServicesOpen(false);
    }
  }

  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-icon" aria-hidden="true">
            C
          </span>

          <span className="brand-name">
            CareerCraft<span className="brand-pk"> PK</span>
          </span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className={`navbar-toggle${menuOpen ? " is-open" : ""}`}
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => {
            setMenuOpen((open) => !open);
            setServicesOpen(false);
          }}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Navigation */}
        <div
          id="primary-navigation"
          className={`navbar-content${menuOpen ? " menu-open" : ""}`}
        >
          <nav className="navbar-links" aria-label="Main navigation">

            <NavLink
              to="/"
              end
              className={getNavLinkClass}
              onClick={closeMenu}
            >
              Home
            </NavLink>

            <NavLink
              to="/careers"
              className={getNavLinkClass}
              onClick={closeMenu}
            >
              Explore Careers
            </NavLink>

            {/* Services Dropdown - Logged-in Users */}
            {!loading && user && (
              <div
                className={`navbar-services${
                  servicesOpen ? " services-open" : ""
                }`}
                onKeyDown={handleServicesKeyDown}
              >
                <button
                  type="button"
                  className={`navbar-services-toggle${
                    isServicesActive ? " active" : ""
                  }`}
                  aria-expanded={servicesOpen}
                  aria-haspopup="true"
                  aria-controls="services-dropdown"
                  onClick={() =>
                    setServicesOpen((open) => !open)
                  }
                >
                  Services

                  <span
                    className="services-chevron"
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </button>

                {servicesOpen && (
                  <div
                    id="services-dropdown"
                    className="navbar-services-menu"
                  >
                    <div className="services-menu-header">
                      <span className="services-menu-title">
                        Career Services
                      </span>

                      <span className="services-menu-subtitle">
                        Tools to support your career journey
                      </span>
                    </div>

                    <div className="services-menu-list">
                      {services.map((service) => (
                        <NavLink
                          key={service.path}
                          to={service.path}
                          className={({ isActive }) =>
                            `navbar-service-link${
                              isActive ? " active" : ""
                            }`
                          }
                          onClick={closeMenu}
                        >
                          <ServiceIcon type={service.icon} />

                          <span className="service-link-content">
                            <span className="service-link-title">
                              {service.title}
                            </span>

                            <span className="service-link-description">
                              {service.description}
                            </span>
                          </span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Account Actions */}
          {!loading && (
            <div className="navbar-actions">
              {user ? (
                <>
                  <div className="navbar-user">
                    <span className="user-avatar" aria-hidden="true">
                      {(user.full_name || "U")
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </span>

                    <span className="user-greeting">
                      <span className="user-greeting-label">
                        Welcome back
                      </span>

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
