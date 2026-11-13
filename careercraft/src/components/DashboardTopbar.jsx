
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/DashboardTopbar.css";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/profile": "Career Profile",
  "/skill-gap": "Skill Gap Analyzer",
  "/job-analyzer": "Job Analyzer",
  "/roadmap": "Career Roadmap",
  "/job-applications": "Job Applications",
  "/cv-generator": "CV Builder",
  "/resume-analyzer": "Resume Analyzer",
  "/interview-preparation": "Interview Preparation",
};

function DashboardTopbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  const fullName = user?.full_name || "User";

  const initials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  function handleLogout() {
    logout();

    navigate("/login", {
      replace: true,
      state: { message: "You have been logged out successfully." },
    });
  }

  return (
    <header className="dashboard-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          aria-controls="dashboard-navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="topbar-heading">
          <p>CareerCraft PK / Workspace</p>
          <h1>{pageTitle}</h1>
        </div>
      </div>

      <div className="topbar-user">
        <div className="topbar-user-info">
          <strong>{fullName}</strong>
          <span>{user?.email || "CareerCraft Member"}</span>
        </div>

        <div className="topbar-avatar" title={fullName}>
          {initials}
        </div>

        <button
          type="button"
          className="topbar-profile-button"
          onClick={() => navigate("/profile")}
        >
          Profile
        </button>

        <button
          type="button"
          className="topbar-logout-button"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
    </header>
  );
}

export default DashboardTopbar;
