import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
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
    skills: [
      "Figma",
      "Wireframing",
      "Prototyping",
      "Typography",
      "User Research",
    ],
  },
  graphic: {
    title: "Graphic Designer",
    skills: [
      "Typography",
      "Color Theory",
      "Layout Design",
      "Branding",
      "Visual Communication",
    ],
  },
  marketing: {
    title: "Digital Marketer",
    skills: [
      "SEO",
      "Content Marketing",
      "Social Media Marketing",
      "Analytics",
      "Campaign Planning",
    ],
  },
  business: {
    title: "Business Analyst",
    skills: [
      "Analytical Thinking",
      "Communication",
      "Excel",
      "Requirements Gathering",
      "Data Interpretation",
    ],
  },
  education: {
    title: "Teacher",
    skills: [
      "Communication",
      "Lesson Planning",
      "Classroom Management",
      "Subject Knowledge",
      "Assessment",
      "Teaching Methods",
      "Student Engagement",
      "Learning Materials",
    ],
  },
  technicalTraining: {
    title: "Technical Trainer",
    skills: [
      "Technical Knowledge",
      "Presentation",
      "Communication",
      "Instructional Design",
      "Problem Solving",
    ],
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
    {
      key: "frontend",
      terms: [
        "frontend",
        "front end",
        "react",
        "html",
        "css developer",
        "web developer",
        "web development",
      ],
    },
    {
      key: "backend",
      terms: [
        "backend",
        "back end",
        "node js",
        "express js",
        "api developer",
        "server side developer",
      ],
    },
    {
      key: "uiux",
      terms: [
        "ui ux",
        "ui designer",
        "ux designer",
        "user experience",
        "user interface designer",
        "product designer",
      ],
    },
    {
      key: "graphic",
      terms: ["graphic designer", "graphic design", "visual designer"],
    },
    {
      key: "marketing",
      terms: [
        "digital marketer",
        "digital marketing",
        "seo specialist",
        "seo analyst",
        "content marketer",
        "social media marketer",
      ],
    },
    {
      key: "business",
      terms: ["business analyst", "business analysis"],
    },
    {
      key: "education",
      terms: ["teacher", "educator", "school teacher"],
    },
    {
      key: "technicalTraining",
      terms: [
        "technical trainer",
        "technical training",
        "it trainer",
        "software trainer",
      ],
    },
  ];

  for (const career of careerMatchers) {
    if (
      career.terms.some(
        (term) => goal === term || goal.includes(term)
      )
    ) {
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

    const availableSkills = careerSkills[careerKey].skills;

    return availableSkills.filter((skill) =>
      saved.some(
        (savedSkill) =>
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

    localStorage.setItem(
      ACTIVITY_STORAGE_KEY,
      JSON.stringify(saved)
    );

    return true;
  } catch (error) {
    console.error("Unable to remove career activity:", error);
    return false;
  }
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

  const visibleActivities = showAllActivities
    ? activities
    : activities.slice(0, INITIAL_ACTIVITY_COUNT);

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
      description:
        `${selectedSkills.length} of ${totalCareerSkills} skills are currently selected for ${career.title}. Review the remaining skills as you learn.`,
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

  return (
    <>
      <Navbar />

      <main className="dashboard-page">
        <div className="dashboard-container">
          <section className="dashboard-welcome">
            <div>
              <span className="dashboard-eyebrow">
                YOUR CAREER WORKSPACE
              </span>

              <h1>
                Welcome back,{" "}
                {user?.full_name?.trim()?.split(/\s+/)[0] || "there"}!
              </h1>

              <p>
                Keep building your skills, tracking your progress,
                and preparing for your next career opportunity.
              </p>
            </div>

            <Link to="/profile" className="dashboard-profile-button">
              View My Profile →
            </Link>
          </section>

          {error && (
            <p className="dashboard-error" role="alert">
              {error}
            </p>
          )}

          <section className="dashboard-overview">
            <article className="dashboard-card dashboard-goal-card">
              <span className="dashboard-card-label">
                YOUR CAREER GOAL
              </span>

              {loading ? (
                <h2>Loading...</h2>
              ) : (
                <h2>{profile.career_goal || "Set your career goal"}</h2>
              )}

              <p>
                {profile.experience_level
                  ? `${profile.experience_level} level`
                  : "Add your experience level to personalize your journey."}
              </p>

              <Link to="/profile" className="dashboard-text-link">
                {profile.career_goal
                  ? "Update career goal"
                  : "Set career goal"} →
              </Link>
            </article>

            <article className="dashboard-card dashboard-completion-card">
              <div className="dashboard-completion-heading">
                <span className="dashboard-card-label">
                  PROFILE COMPLETION
                </span>

                <strong>
                  {loading ? "—" : `${completionPercentage}%`}
                </strong>
              </div>

              <div
                className="dashboard-progress-track"
                role="progressbar"
                aria-label="Profile completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={loading ? 0 : completionPercentage}
              >
                <div
                  className="dashboard-progress-fill"
                  style={{
                    width: `${loading ? 0 : completionPercentage}%`,
                  }}
                />
              </div>

              <p>
                {loading
                  ? "Checking your profile..."
                  : `${completedFields} of ${profileFields.length} profile fields completed.`}
              </p>

              <Link to="/profile" className="dashboard-text-link">
                Complete your profile →
              </Link>
            </article>
          </section>

          <section className="dashboard-tools-section">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-eyebrow">
                  YOUR LEARNING JOURNEY
                </span>

                <h2>Career Progress Overview</h2>

                <p>
                  See your selected skills and latest learning roadmap.
                </p>
              </div>
            </div>

            <div className="dashboard-tools-grid">
              <article className="dashboard-tool-card">
                <div className="dashboard-tool-icon skill-tool-icon">
                  ✳
                </div>

                <h3>Career Skills</h3>

                {loading ? (
                  <p>Loading your career information...</p>
                ) : !career ? (
                  <>
                    <p>
                      {profile.career_goal
                        ? "Your career goal does not match a supported skill category yet."
                        : "Set your career goal to see relevant skills."}
                    </p>

                    <Link to="/profile" className="dashboard-tool-link">
                      {profile.career_goal
                        ? "Review career goal"
                        : "Set career goal"} →
                    </Link>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>
                        {selectedSkills.length}/{totalCareerSkills}
                      </strong>{" "}
                      skills selected
                    </p>

                    <div
                      className="dashboard-progress-track"
                      role="progressbar"
                      aria-label="Self-assessed career skill coverage"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={skillPercentage}
                    >
                      <div
                        className="dashboard-progress-fill"
                        style={{ width: `${skillPercentage}%` }}
                      />
                    </div>

                    <p>{skillPercentage}% self-assessed coverage.</p>

                    <Link
                      to={`/skill-gap?career=${careerKey}`}
                      className="dashboard-tool-link"
                    >
                      Review skills →
                    </Link>
                  </>
                )}
              </article>

              <article className="dashboard-tool-card">
                <div className="dashboard-tool-icon roadmap-tool-icon">
                  ▤
                </div>

                <h3>Learning Roadmap</h3>

                {!latestRoadmap ? (
                  <>
                    <p>
                      No roadmap activity is recorded yet. Analyze a job
                      description to get started.
                    </p>

                    <Link
                      to="/job-analyzer"
                      className="dashboard-tool-link"
                    >
                      Create a roadmap →
                    </Link>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>{roadmapTitle}</strong>
                    </p>

                    {roadmapCompany && <p>Company: {roadmapCompany}</p>}

                    {roadmapPercentage !== null ? (
                      <>
                        <p>
                          {completedRoadmapCount}/{roadmapTotal} steps
                          completed
                        </p>

                        <div
                          className="dashboard-progress-track"
                          role="progressbar"
                          aria-label="Learning roadmap completion"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={roadmapPercentage}
                        >
                          <div
                            className="dashboard-progress-fill"
                            style={{
                              width: `${roadmapPercentage}%`,
                            }}
                          />
                        </div>

                        <p>{roadmapPercentage}% complete.</p>
                      </>
                    ) : (
                      <p>
                        {completedRoadmapCount} completed steps recorded.
                        Total steps are unavailable.
                      </p>
                    )}

                    <Link to="/roadmap" className="dashboard-tool-link">
                      Open roadmap →
                    </Link>
                  </>
                )}
              </article>
            </div>
          </section>

          <section className="dashboard-tools-section">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-eyebrow">
                  TAKE YOUR NEXT STEP
                </span>

                <h2>Your Career Tools</h2>

                <p>
                  Choose a tool to continue your career preparation.
                </p>
              </div>
            </div>

            <div className="dashboard-tools-grid">
              <article className="dashboard-tool-card">
                <div className="dashboard-tool-icon skill-tool-icon">
                  ✳
                </div>

                <h3>Skill Gap Analysis</h3>

                <p>
                  Find skills to develop for your target career.
                </p>

                <Link to="/skill-gap" className="dashboard-tool-link">
                  Explore skills →
                </Link>
              </article>

              <article className="dashboard-tool-card">
                <div className="dashboard-tool-icon analyzer-tool-icon">
                  ↗
                </div>

                <h3>Job Analyzer</h3>

                <p>
                  Identify skills required for a job opportunity.
                </p>

                <Link to="/job-analyzer" className="dashboard-tool-link">
                  Analyze a job →
                </Link>
              </article>

              <article className="dashboard-tool-card">
                <div className="dashboard-tool-icon roadmap-tool-icon">
                  ▤
                </div>

                <h3>Job Application Tracker</h3>

                <p>
                  Track applications, update statuses, and manage interview
                  dates and notes.
                </p>

                <Link
                  to="/job-applications"
                  className="dashboard-tool-link"
                >
                  Track applications →
                </Link>
              </article>

              <article className="dashboard-tool-card">
                <div className="dashboard-tool-icon profile-tool-icon">
                  ◎
                </div>

                <h3>CV Builder</h3>

                <p>
                  Create a professional CV tailored to your career goals.
                </p>

                <Link
                  to="/cv-generator"
                  className="dashboard-tool-link"
                >
                  Build my CV →
                </Link>
              </article>

              <article className="dashboard-tool-card">
                <div className="dashboard-tool-icon profile-tool-icon">
                  ◎
                </div>

                <h3>Career Profile</h3>

                <p>
                  Update your education, experience, and career goal.
                </p>

                <Link to="/profile" className="dashboard-tool-link">
                  Update profile →
                </Link>
              </article>
            </div>
          </section>

          {!loading && (
            <section className="dashboard-next-step">
              <div>
                <span className="dashboard-eyebrow">
                  RECOMMENDED NEXT STEP
                </span>

                <h2>{nextAction.title}</h2>
                <p>{nextAction.description}</p>
              </div>

              <Link
                to={nextAction.link}
                className="dashboard-profile-button"
              >
                {nextAction.label} →
              </Link>
            </section>
          )}

          <section className="dashboard-activity-section">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-eyebrow">
                  YOUR RECENT PROGRESS
                </span>

                <h2>Recent Activity</h2>

                <p>Review or remove your recent career updates.</p>
              </div>
            </div>

            {activities.length === 0 ? (
              <div className="dashboard-activity-empty">
                <h3>No recent activity</h3>

                <p>
                  Your job analyses and learning updates will appear here.
                </p>

                <Link to="/job-analyzer" className="dashboard-tool-link">
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
                            <h3>
                              {getActivityDescription(activity)}
                            </h3>

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
                              {activity.skillCount === 1
                                ? "skill"
                                : "skills"}
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
