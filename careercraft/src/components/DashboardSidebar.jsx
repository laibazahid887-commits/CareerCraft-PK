
import { NavLink } from "react-router-dom";
import "../styles/DashboardSidebar.css";

const navigation = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: "◫" },
      { label: "Career Profile", path: "/profile", icon: "◎" },
    ],
  },
  {
    title: "CAREER TOOLS",
    items: [
      { label: "Skill Gap Analyzer", path: "/skill-gap", icon: "◈" },
      { label: "Job Analyzer", path: "/job-analyzer", icon: "⌕" },
      { label: "Career Roadmap", path: "/roadmap", icon: "↗" },
      { label: "Job Applications", path: "/job-applications", icon: "▤" },
    ],
  },
  {
    title: "RESUME & GROWTH",
    items: [
      { label: "CV Builder", path: "/cv-generator", icon: "▧" },
      { label: "Resume Analyzer", path: "/resume-analyzer", icon: "▥" },
      {
        label: "Interview Preparation",
        path: "/interview-preparation",
        icon: "◉",
      },
    ],
  },
];

function DashboardSidebar({ isOpen, onClose }) {
  return (
    <aside
      className={`dashboard-sidebar ${isOpen ? "is-open" : ""}`}
      aria-label="Dashboard navigation"
    >
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">C</div>

        <div>
          <h2>CareerCraft</h2>
          <span>PK</span>
        </div>
      </div>

<button
  type="button"
  className="sidebar-close-button"
  onClick={onClose}
  aria-label="Close navigation menu"
>
  ×
</button>

      <nav className="sidebar-navigation">
        {navigation.map((section) => (
          <div className="sidebar-section" key={section.title}>
            <p className="sidebar-section-title">{section.title}</p>

            {section.items.map((item) => (
              <NavLink
                to={item.path}
                key={item.path}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <span className="sidebar-link-icon" aria-hidden="true">
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>Build your future,</p>
        <strong>one step at a time.</strong>
        <span>CareerCraft PK © 2026</span>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
