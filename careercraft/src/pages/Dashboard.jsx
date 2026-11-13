
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfile } from "../services/profileService";
import "./Dashboard.css";

const ACTIVITY_STORAGE_KEY = "careerCraftRecentActivity";
const INITIAL_ACTIVITY_COUNT = 5;

const emptyProfile = {
  education_level: "",
  field_of_study: "",
  career_goal: "",
  experience_level: "",
  location: "",
  bio: "",
};

const careerSkills = {
  frontend: {
    title: "Frontend Developer",
    skills: ["HTML", "CSS", "JavaScript", "React", "Git and GitHub"],
  },
  backend: {
    title: "Backend Developer",
    skills: ["JavaScript", "Node.js", "Express", "PostgreSQL", "REST APIs"],
  },
  uiux: {
    title: "UI/UX Designer",
    skills: ["Figma", "Wireframing", "Prototyping", "Typography", "User Research"],
  },
  graphic: {
    title: "Graphic Designer",
    skills: ["Typography", "Color Theory", "Layout Design", "Branding", "Visual Communication"],
  },
  marketing: {
    title: "Digital Marketer",
    skills: ["SEO", "Content Marketing", "Social Media Marketing", "Analytics", "Campaign Planning"],
  },
  business: {
    title: "Business Analyst",
    skills: ["Analytical Thinking", "Communication", "Excel", "Requirements Gathering", "Data Interpretation"],
  },
  education: {
    title: "Teacher",
    skills: ["Communication", "Lesson Planning", "Classroom Management", "Subject Knowledge", "Assessment", "Teaching Methods", "Student Engagement", "Learning Materials"],
  },
  technicalTraining: {
    title: "Technical Trainer",
    skills: ["Technical Knowledge", "Presentation", "Communication", "Instructional Design", "Problem Solving"],
  },
};

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getCareerKey(careerGoal) {
  const goal = normalizeText(careerGoal);

  if (!goal) return null;

  const careerMatchers = [
    { key: "frontend", terms: ["frontend", "front end", "react", "html", "css developer", "web developer", "web development"] },
    { key: "backend", terms: ["backend", "back end", "node js", "express js", "api developer", "server side developer"] },
    { key: "uiux", terms: ["ui ux", "ui designer", "ux designer", "user experience", "user interface designer", "product designer"] },
    { key: "graphic", terms: ["graphic designer", "graphic design", "visual designer"] },
    { key: "marketing", terms: ["digital marketer", "digital marketing", "seo specialist", "seo analyst", "content marketer", "social media marketer"] },
    { key: "business", terms: ["business analyst", "business analysis"] },
    { key: "education", terms: ["teacher", "educator", "school teacher"] },
    { key: "technicalTraining", terms: ["technical trainer", "technical training", "it trainer", "software trainer"] },
  ];

  for (const career of careerMatchers) {
    if (career.terms.some((term) => goal === term || goal.includes(term))) {
      return career.key;
    }
  }

  return null;
}

function readSavedSkills(careerKey) {
  if (!careerKey) return [];

  try {
    const saved = JSON.parse(
      localStorage.getItem(`careerCraftSkills_${careerKey}`) || "[]"
    );

    if (!Array.isArray(saved)) return [];

    return careerSkills[careerKey].skills.filter((skill) =>
      saved.some((savedSkill) =>
        normalizeText(savedSkill) === normalizeText(skill)
      )
    );
  } catch {
    return [];
  }
}

function getRoadmapProgressKey(title, company) {
  const role = title || "general";
  const organization = company || "any-company";

  return `careerCraftRoadmapProgress_${[role, organization]
    .join("_")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")}`;
}

function readCompletedRoadmapSkills(title, company) {
  try {
    const saved = JSON.parse(
      localStorage.getItem(getRoadmapProgressKey(title, company)) || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function getUniqueCareerActivities(activities) {
  const seenRoadmaps = new Set();

  return activities.filter((activity) => {
    if (activity?.type !== "roadmap_opened") return true;

    const role = String(activity.title || "").trim().toLowerCase();
    const company = String(activity.company || "").trim().toLowerCase();
    const key = `${role}::${company}`;

    if (seenRoadmaps.has(key)) return false;

    seenRoadmaps.add(key);
    return true;
  });
}

function readCareerActivities() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(ACTIVITY_STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(saved)) return [];

    const sorted = [...saved].sort((a, b) => {
      const dateA = Date.parse(a?.timestamp || "");
      const dateB = Date.parse(b?.timestamp || "");

      const validA = Number.isNaN(dateA) ? -Infinity : dateA;
      const validB = Number.isNaN(dateB) ? -Infinity : dateB;

      return validB - validA;
    });

    return getUniqueCareerActivities(sorted);
  } catch {
    return [];
  }
}

function getActivityDescription(activity) {
  switch (activity.type) {
    case "job_analysis":
      return "Job description analyzed";
    case "roadmap_opened":
      return "Learning roadmap opened";
    case "skill_completed":
      return "Skill marked complete";
    case "skill_uncompleted":
      return "Skill marked incomplete";
    case "roadmap_progress_reset":
      return "Roadmap progress reset";
    default:
      return "Career activity";
  }
}

function getActivityIcon(type) {
  switch (type) {
    case "job_analysis":
      return "↗";
    case "skill_completed":
      return "✓";
    case "skill_uncompleted":
      return "↶";
    case "roadmap_progress_reset":
      return "↻";
    case "roadmap_opened":
      return "▤";
    default:
      return "•";
  }
}

function removeCareerActivity(activity) {
  try {
    const saved = JSON.parse(
      localStorage.getItem(ACTIVITY_STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(saved)) return false;

    const index = activity.id
      ? saved.findIndex((item) => item?.id === activity.id)
      : saved.findIndex(
          (item) => JSON.stringify(item) === JSON.stringify(activity)
        );

    if (index === -1) return false;

    saved.splice(index, 1);
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(saved));

    return true;
  } catch (error) {
    console.error("Unable to remove career activity:", error);
    return false;
  }
}

function ProgressBar({ percentage, label }) {
  return (
    <div
      className="dashboard-progress-track"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
    >
      <div
        className="dashboard-progress-fill"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activities, setActivities] = useState(readCareerActivities);
  const [showAllActivities, setShowAllActivities] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await getProfile();

        setProfile({
          ...emptyProfile,
          ...(response.data || {}),
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load your profile information."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  useEffect(() => {
    function refreshActivities() {
      setActivities(readCareerActivities());
    }

    refreshActivities();

    window.addEventListener("focus", refreshActivities);
    window.addEventListener("pageshow", refreshActivities);

    return () => {
      window.removeEventListener("focus", refreshActivities);
      window.removeEventListener("pageshow", refreshActivities);
    };
  }, []);

  function handleRemoveActivity(activity) {
    const removed = removeCareerActivity(activity);

    if (removed) {
      setActivities(readCareerActivities());
    }
  }

  const profileFields = [
    profile.education_level,
    profile.field_of_study,
    profile.career_goal,
    profile.experience_level,
    profile.location,
    profile.bio,
  ];

  const completedFields = profileFields.filter(
    (field) => String(field || "").trim() !== ""
  ).length;

  const completionPercentage = Math.round(
    (completedFields / profileFields.length) * 100
  );

  const careerKey = getCareerKey(profile.career_goal);
  const career = careerKey ? careerSkills[careerKey] : null;
  const selectedSkills = readSavedSkills(careerKey);
  const totalCareerSkills = career?.skills.length || 0;

  const missingSkills = career
    ? career.skills.filter((skill) => !selectedSkills.includes(skill))
    : [];

  const skillPercentage =
    totalCareerSkills > 0
      ? Math.round((selectedSkills.length / totalCareerSkills) * 100)
      : 0;

  const latestRoadmap = activities.find(
    (activity) => activity?.type === "roadmap_opened"
  );

  const roadmapTitle = latestRoadmap?.title || "";
  const roadmapCompany = latestRoadmap?.company || "";

  const completedRoadmapSkills = latestRoadmap
    ? readCompletedRoadmapSkills(roadmapTitle, roadmapCompany)
    : [];

  const roadmapTotal =
    typeof latestRoadmap?.skillCount === "number" &&
    latestRoadmap.skillCount >= 0
      ? latestRoadmap.skillCount
      : null;

  const completedRoadmapCount =
    roadmapTotal === null
      ? completedRoadmapSkills.length
      : Math.min(completedRoadmapSkills.length, roadmapTotal);

  const roadmapPercentage =
    roadmapTotal !== null && roadmapTotal > 0
      ? Math.round((completedRoadmapCount / roadmapTotal) * 100)
      : roadmapTotal === 0
        ? 100
        : null;

  const visibleActivities = showAllActivities
    ? activities
    : activities.slice(0, INITIAL_ACTIVITY_COUNT);

  let nextAction;

  if (!profile.career_goal?.trim()) {
    nextAction = {
      title: "Start with your career goal",
      description:
        "Tell us which career you want to pursue to personalize your career planning.",
      link: "/profile",
      label: "Set My Career Goal",
    };
  } else if (!career) {
    nextAction = {
      title: "Explore your career options",
      description:
        "Your career goal does not yet match a supported Skill Gap category. Review the available career paths or update your goal.",
      link: "/skill-gap",
      label: "Explore Skill Gaps",
    };
  } else if (missingSkills.length > 0) {
    nextAction = {
      title: "Review your career skills",
      description: `${selectedSkills.length} of ${totalCareerSkills} skills are currently selected for ${career.title}. Review the remaining skills as you learn.`,
      link: `/skill-gap?career=${careerKey}`,
      label: "Review Skill Gaps",
    };
  } else if (latestRoadmap && roadmapPercentage !== 100) {
    nextAction = {
      title: "Continue your learning roadmap",
      description:
        "Pick up where you left off and continue working through your learning steps.",
      link: "/roadmap",
      label: "Continue Roadmap",
    };
  } else if (!latestRoadmap) {
    nextAction = {
      title: "Analyze a job opportunity",
      description:
        "Analyze a job description to identify skills you may need to develop.",
      link: "/job-analyzer",
      label: "Analyze a Job",
    };
  } else {
    nextAction = {
      title: "Explore another opportunity",
      description:
        "Your latest recorded roadmap is complete. Analyze another job to discover your next learning goals.",
      link: "/job-analyzer",
      label: "Analyze Another Job",
    };
  }

  const firstName =
    user?.full_name?.trim()?.split(/\s+/)[0] || "there";

  return (
    <>

      <main className="dashboard-page">
        <div className="dashboard-container">

          {/* Welcome hero */}
          <section className="dashboard-hero">
            <div className="dashboard-hero-content">
              <span className="dashboard-eyebrow">
                YOUR PERSONAL CAREER SPACE
              </span>

              <h1>
                Welcome back, <span>{firstName}!</span>
              </h1>

              <p>
                Your next opportunity starts with the progress you make
                today. Keep learning, building, and moving forward.
              </p>

              <div className="dashboard-hero-actions">
                <Link to="/profile" className="dashboard-primary-button">
                  View My Profile <span>→</span>
                </Link>

                <Link  to="/careers" className="dashboard-secondary-link">
                  Explore Careers
                </Link>
              </div>

              <div className="dashboard-hero-note">
                <span className="dashboard-note-icon">✦</span>
                <div>
                  <strong>Small steps create big careers.</strong>
                  <span>Stay consistent with your learning journey.</span>
                </div>
              </div>
            </div>

            <div className="dashboard-hero-visual">
              <div className="dashboard-visual-orbit dashboard-orbit-one" />
              <div className="dashboard-visual-orbit dashboard-orbit-two" />

              <div className="dashboard-career-preview">
                <div className="dashboard-preview-top">
                  <span className="dashboard-preview-icon">✦</span>
                  <span className="dashboard-preview-status">
                    YOUR CAREER OVERVIEW
                  </span>
                </div>

                <span className="dashboard-preview-label">
                  CURRENT CAREER GOAL
                </span>

                <h2>
                  {loading
                    ? "Loading..."
                    : profile.career_goal || "Choose your direction"}
                </h2>

                <p>
                  {profile.experience_level
                    ? `${profile.experience_level} level`
                    : "Your career journey starts here"}
                </p>

                <div className="dashboard-preview-divider" />

                <div className="dashboard-preview-progress-heading">
                  <span>Profile completion</span>
                  <strong>
                    {loading ? "—" : `${completionPercentage}%`}
                  </strong>
                </div>

                <ProgressBar
                  percentage={loading ? 0 : completionPercentage}
                  label="Profile completion"
                />

                <div className="dashboard-preview-footer">
                  <span>✧</span>
                  {completedFields} of {profileFields.length} profile details added
                </div>
              </div>

              <div className="dashboard-floating-card dashboard-floating-top">
                <span className="dashboard-floating-icon">✓</span>
                <div>
                  <strong>Clear next steps</strong>
                  <span>Build your career plan</span>
                </div>
              </div>

              <div className="dashboard-floating-card dashboard-floating-bottom">
                <span className="dashboard-floating-icon">↗</span>
                <div>
                  <strong>Keep progressing</strong>
                  <span>One skill at a time</span>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <p className="dashboard-error" role="alert">
              {error}
            </p>
          )}

          {/* Quick statistics */}
          <section className="dashboard-stat-grid">
            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon stat-profile-icon">◎</div>
              <div>
                <span>Profile completion</span>
                <strong>{loading ? "—" : `${completionPercentage}%`}</strong>
                <small>Personal information</small>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon stat-skill-icon">✳</div>
              <div>
                <span>Career skills</span>
                <strong>
                  {loading || !career
                    ? "—"
                    : `${selectedSkills.length}/${totalCareerSkills}`}
                </strong>
                <small>Self-assessed skills</small>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon stat-roadmap-icon">▤</div>
              <div>
                <span>Roadmap progress</span>
                <strong>
                  {roadmapPercentage === null
                    ? "—"
                    : `${roadmapPercentage}%`}
                </strong>
                <small>
                  {latestRoadmap ? "Latest learning roadmap" : "No roadmap recorded"}
                </small>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon stat-activity-icon">↗</div>
              <div>
                <span>Recent activities</span>
                <strong>{activities.length}</strong>
                <small>Career updates recorded</small>
              </div>
            </article>
          </section>

          {/* Career progress */}
          <section className="dashboard-main-section">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-eyebrow">
                  YOUR LEARNING JOURNEY
                </span>
                <h2>Career Progress Overview</h2>
                <p>Track your selected skills and latest learning roadmap.</p>
              </div>

              <Link to="/skill-gap" className="dashboard-heading-link">
                View all skills →
              </Link>
            </div>

            <div className="dashboard-progress-grid">

              <article className="dashboard-feature-card dashboard-skills-card">
                <div className="dashboard-feature-heading">
                  <div className="dashboard-feature-icon skill-tool-icon">✳</div>
                  <div>
                    <span className="dashboard-card-label">SKILL DEVELOPMENT</span>
                    <h3>Career Skills</h3>
                  </div>
                </div>

                {loading ? (
                  <p>Loading your career information...</p>
                ) : !career ? (
                  <>
                    <p>
                      {profile.career_goal
                        ? "Your career goal does not match a supported skill category yet."
                        : "Set your career goal to see the skills relevant to your career."}
                    </p>
                    <Link to="/profile" className="dashboard-card-action">
                      {profile.career_goal ? "Review career goal" : "Set career goal"} →
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="dashboard-feature-metric">
                      <strong>{selectedSkills.length}</strong>
                      <span>of {totalCareerSkills} skills selected</span>
                    </div>

                    <ProgressBar
                      percentage={skillPercentage}
                      label="Self-assessed career skill coverage"
                    />

                    <div className="dashboard-progress-caption">
                      <span>Self-assessed coverage</span>
                      <strong>{skillPercentage}%</strong>
                    </div>

                    <div className="dashboard-skill-preview">
                      {career.skills.map((skill) => {
                        const isSelected = selectedSkills.includes(skill);

                        return (
                          <span
                            key={skill}
                            className={isSelected ? "skill-chip skill-chip-selected" : "skill-chip"}
                          >
                            <span>{isSelected ? "✓" : "+"}</span>
                            {skill}
                          </span>
                        );
                      })}
                    </div>

                    <Link
                      to={`/skill-gap?career=${careerKey}`}
                      className="dashboard-card-action"
                    >
                      Review skill gaps →
                    </Link>
                  </>
                )}
              </article>

              <article className="dashboard-feature-card dashboard-roadmap-card">
                <div className="dashboard-feature-heading">
                  <div className="dashboard-feature-icon roadmap-tool-icon">▤</div>
                  <div>
                    <span className="dashboard-card-label">LEARNING PLAN</span>
                    <h3>Learning Roadmap</h3>
                  </div>
                </div>

                {!latestRoadmap ? (
                  <>
                    <div className="dashboard-empty-illustration">✧</div>
                    <h4>Your roadmap is waiting</h4>
                    <p>
                      Analyze a job description to identify the skills you
                      need and start building your learning plan.
                    </p>
                    <Link to="/job-analyzer" className="dashboard-card-action">
                      Create a roadmap →
                    </Link>
                  </>
                ) : (
                  <>
                    <span className="dashboard-roadmap-role">
                      {roadmapTitle}
                    </span>

                    {roadmapCompany && (
                      <p className="dashboard-roadmap-company">
                        Company: {roadmapCompany}
                      </p>
                    )}

                    <div className="dashboard-feature-metric">
                      <strong>{completedRoadmapCount}</strong>
                      <span>
                        {roadmapTotal !== null
                          ? `of ${roadmapTotal} steps completed`
                          : "completed steps recorded"}
                      </span>
                    </div>

                    {roadmapPercentage !== null ? (
                      <>
                        <ProgressBar
                          percentage={roadmapPercentage}
                          label="Learning roadmap completion"
                        />
                        <div className="dashboard-progress-caption">
                          <span>Roadmap completion</span>
                          <strong>{roadmapPercentage}%</strong>
                        </div>
                      </>
                    ) : (
                      <p className="dashboard-roadmap-note">
                        Total roadmap steps are currently unavailable.
                      </p>
                    )}

                    <Link to="/roadmap" className="dashboard-card-action">
                      Continue learning →
                    </Link>
                  </>
                )}
              </article>
            </div>
          </section>

          {/* Career tools */}
          <section className="dashboard-main-section">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-eyebrow">TOOLS FOR YOUR FUTURE</span>
                <h2>Your Career Workspace</h2>
                <p>Everything you need to prepare for your next opportunity.</p>
              </div>
            </div>

            <div className="dashboard-tools-grid">

              <Link to="/skill-gap" className="dashboard-tool-card">
                <div className="dashboard-tool-icon skill-tool-icon">✳</div>
                <span className="dashboard-tool-number">01</span>
                <h3>Skill Gap Analysis</h3>
                <p>Discover the skills you already have and identify what you need to improve.</p>
                <span className="dashboard-tool-link">Explore skills <span>→</span></span>
              </Link>

              <Link to="/job-analyzer" className="dashboard-tool-card">
                <div className="dashboard-tool-icon analyzer-tool-icon">↗</div>
                <span className="dashboard-tool-number">02</span>
                <h3>Job Analyzer</h3>
                <p>Analyze job descriptions and understand the skills employers expect.</p>
                <span className="dashboard-tool-link">Analyze a job <span>→</span></span>
              </Link>

              <Link to="/roadmap" className="dashboard-tool-card">
                <div className="dashboard-tool-icon roadmap-tool-icon">▤</div>
                <span className="dashboard-tool-number">03</span>
                <h3>Learning Roadmap</h3>
                <p>Follow structured learning steps and keep track of your progress.</p>
                <span className="dashboard-tool-link">Open roadmap <span>→</span></span>
              </Link>

              <Link to="/job-applications" className="dashboard-tool-card">
                <div className="dashboard-tool-icon application-tool-icon">▣</div>
                <span className="dashboard-tool-number">04</span>
                <h3>Job Application Tracker</h3>
                <p>Manage job applications, update statuses, and organize interview details.</p>
                <span className="dashboard-tool-link">Track applications <span>→</span></span>
              </Link>

              <Link to="/cv-generator" className="dashboard-tool-card">
                <div className="dashboard-tool-icon cv-tool-icon">▧</div>
                <span className="dashboard-tool-number">05</span>
                <h3>CV Builder</h3>
                <p>Create a professional CV that highlights your skills and experience.</p>
                <span className="dashboard-tool-link">Build my CV <span>→</span></span>
              </Link>

              <Link to="/profile" className="dashboard-tool-card">
                <div className="dashboard-tool-icon profile-tool-icon">◎</div>
                <span className="dashboard-tool-number">06</span>
                <h3>Career Profile</h3>
                <p>Keep your education, experience, location, and career goal updated.</p>
                <span className="dashboard-tool-link">Update profile <span>→</span></span>
              </Link>
            </div>
          </section>

          {/* Recommended next step */}
          {!loading && (
            <section className="dashboard-next-step">
              <div className="dashboard-next-step-content">
                <span className="dashboard-eyebrow">
                  YOUR RECOMMENDED NEXT STEP
                </span>
                <h2>{nextAction.title}</h2>
                <p>{nextAction.description}</p>
                <Link
                  to={nextAction.link}
                  className="dashboard-primary-button"
                >
                  {nextAction.label} <span>→</span>
                </Link>
              </div>

              <div className="dashboard-next-step-decoration">
                <span>✦</span>
                <span>↗</span>
              </div>
            </section>
          )}

          {/* Recent activity */}
          <section className="dashboard-activity-section">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-eyebrow">YOUR RECENT PROGRESS</span>
                <h2>Recent Activity</h2>
                <p>Keep an eye on the work you have completed.</p>
              </div>
            </div>

            {activities.length === 0 ? (
              <div className="dashboard-activity-empty">
                <div className="dashboard-empty-illustration">✧</div>
                <h3>Your activity will appear here</h3>
                <p>
                  Your job analyses and learning updates will be recorded
                  here as you use CareerCraft PK.
                </p>
                <Link to="/job-analyzer" className="dashboard-card-action">
                  Analyze your first job →
                </Link>
              </div>
            ) : (
              <>
                <div className="dashboard-activity-list">
                  {visibleActivities.map((activity, index) => (
                    <article
                      className="dashboard-activity-item"
                      key={activity.id || `${activity.type}-${index}`}
                    >
                      <div
                        className="dashboard-activity-marker"
                        aria-hidden="true"
                      >
                        {getActivityIcon(activity.type)}
                      </div>

                      <div className="dashboard-activity-details">
                        <div className="dashboard-activity-heading">
                          <div>
                            <h3>{getActivityDescription(activity)}</h3>
                            <p className="dashboard-activity-title">
                              {activity.title || "Career development"}
                            </p>
                          </div>

                          <button
                            type="button"
                            className="dashboard-activity-remove"
                            onClick={() => handleRemoveActivity(activity)}
                            aria-label={`Remove activity: ${getActivityDescription(activity)}`}
                            title="Remove this activity"
                          >
                            <span aria-hidden="true">×</span>
                            <span>Remove</span>
                          </button>
                        </div>

                        <div className="dashboard-activity-meta">
                          {activity.company && (
                            <span>Company: {activity.company}</span>
                          )}

                          {typeof activity.skillCount === "number" && (
                            <span>
                              {activity.skillCount}{" "}
                              {activity.skillCount === 1 ? "skill" : "skills"}
                            </span>
                          )}
                        </div>

                        <time className="dashboard-activity-time">
                          {activity.timestamp &&
                          !Number.isNaN(Date.parse(activity.timestamp))
                            ? new Date(activity.timestamp).toLocaleString()
                            : "Date unavailable"}
                        </time>
                      </div>
                    </article>
                  ))}
                </div>

                {activities.length > INITIAL_ACTIVITY_COUNT && (
                  <div className="dashboard-activity-actions">
                    <button
                      type="button"
                      className="dashboard-activity-toggle"
                      onClick={() =>
                        setShowAllActivities((current) => !current)
                      }
                      aria-expanded={showAllActivities}
                    >
                      {showAllActivities ? "Show Less ↑" : "Show More ↓"}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default Dashboard;
