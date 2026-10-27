
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { generateRoadmap } from "../services/roadmapService";
import "./Roadmap.css";

const ACTIVITY_STORAGE_KEY = "careerCraftRecentActivity";

function readSessionRoadmap() {
  try {
    const saved = JSON.parse(
      sessionStorage.getItem("careerCraftRoadmap") || "{}"
    );

    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function readCompletedSkills(storageKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");

    return Array.isArray(saved)
      ? saved.filter((skill) => typeof skill === "string")
      : [];
  } catch {
    return [];
  }
}

function saveCareerActivity(activity) {
  try {
    const saved = JSON.parse(
      localStorage.getItem(ACTIVITY_STORAGE_KEY) || "[]"
    );

    const activities = Array.isArray(saved) ? saved : [];

    const newActivity = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...activity,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(
      ACTIVITY_STORAGE_KEY,
      JSON.stringify([newActivity, ...activities].slice(0, 10))
    );
  } catch {
    // Keep roadmap functionality available if storage fails.
  }
}

function getRoadmapKey(jobTitle, company) {
  return [jobTitle || "general", company || "any-company"]
    .join("_")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-");
}

function Roadmap() {
  const location = useLocation();
  const savedRoadmapData = readSessionRoadmap();

  const missingSkills =
    location.state?.missingSkills ??
    savedRoadmapData.missingSkills ??
    [];

  const jobTitle =
    location.state?.jobTitle ??
    savedRoadmapData.jobTitle ??
    "";

  const company =
    location.state?.company ??
    savedRoadmapData.company ??
    "";

  const roadmap = generateRoadmap(
    Array.isArray(missingSkills) ? missingSkills : []
  );

  const storageKey = `careerCraftRoadmapProgress_${getRoadmapKey(
    jobTitle,
    company
  )}`;

  const [completedSkills, setCompletedSkills] = useState(() =>
    readCompletedSkills(storageKey)
  );

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(completedSkills));
    } catch {
      // Ignore unavailable browser storage.
    }
  }, [storageKey, completedSkills]);

  useEffect(() => {
    if (roadmap.length === 0) return;

    const openedKey = `careerCraftRoadmapOpened_${getRoadmapKey(
      jobTitle,
      company
    )}`;

    try {
      if (sessionStorage.getItem(openedKey) === "true") return;

      sessionStorage.setItem(openedKey, "true");

      saveCareerActivity({
        type: "roadmap_opened",
        title: jobTitle.trim() || "General Learning Roadmap",
        company: company.trim(),
        skillCount: roadmap.length,
      });
    } catch {
      // Ignore unavailable session storage.
    }
  }, [roadmap.length, jobTitle, company]);

  const completedCount = roadmap.filter((skill) =>
    completedSkills.includes(skill.name)
  ).length;

  const progressPercentage = roadmap.length
    ? Math.round((completedCount / roadmap.length) * 100)
    : 0;

  function toggleSkillCompletion(skillName) {
    const wasCompleted = completedSkills.includes(skillName);

    setCompletedSkills((current) =>
      current.includes(skillName)
        ? current.filter((name) => name !== skillName)
        : [...current, skillName]
    );

    saveCareerActivity({
      type: wasCompleted ? "skill_uncompleted" : "skill_completed",
      title: skillName,
      jobTitle: jobTitle.trim() || "General Learning Roadmap",
      company: company.trim(),
    });
  }

  function handleResetProgress() {
    if (completedSkills.length === 0) return;

    setCompletedSkills([]);

    saveCareerActivity({
      type: "roadmap_progress_reset",
      title: jobTitle.trim() || "General Learning Roadmap",
      company: company.trim(),
      skillCount: roadmap.length,
    });
  }

  return (
    <>
      <Navbar />

      <main className="roadmap-page">
        <div className="roadmap-container">
          <Link to="/job-analyzer" className="roadmap-back">
            ← Back to Job Analyzer
          </Link>

          <header className="roadmap-header">
            <h1>My Learning Roadmap</h1>

            {(jobTitle || company) && (
              <p>
                {jobTitle}
                {company ? ` · ${company}` : ""}
              </p>
            )}
          </header>

          {roadmap.length > 0 && (
            <section className="roadmap-progress">
              <div className="roadmap-progress-heading">
                <div>
                  <h2>Learning Progress</h2>
                  <p>
                    {completedCount} of {roadmap.length} steps completed
                  </p>
                </div>

                <strong>{progressPercentage}%</strong>
              </div>

              <div
                className="roadmap-progress-track"
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Learning roadmap progress"
              >
                <div
                  className="roadmap-progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="roadmap-progress-footer">
                <span>
                  {progressPercentage === 100
                    ? "Roadmap completed!"
                    : "Complete each step as you learn."}
                </span>

                {completedCount > 0 && (
                  <button
                    type="button"
                    className="roadmap-reset-button"
                    onClick={handleResetProgress}
                  >
                    Reset Progress
                  </button>
                )}
              </div>
            </section>
          )}

          {roadmap.length === 0 ? (
            <section className="roadmap-empty">
              <h2>No learning steps yet</h2>
              <p>
                Analyze a job description to create a roadmap from your
                identified skill gaps.
              </p>
              <Link to="/job-analyzer" className="roadmap-button">
                Analyze a Job →
              </Link>
            </section>
          ) : (
            <section className="roadmap-content">
              <div className="roadmap-list">
                {roadmap.map((skill, index) => {
                  const isCompleted = completedSkills.includes(skill.name);
                  const priority = (skill.priority || "Low").toLowerCase();

                  return (
                    <article
                      className={`roadmap-card ${
                        isCompleted ? "roadmap-card-completed" : ""
                      }`}
                      key={skill.name}
                    >
                      <div className="roadmap-card-top">
                        <span className="roadmap-step-number">
                          {index + 1}
                        </span>

                        <span
                          className={`roadmap-priority priority-${priority}`}
                        >
                          {skill.priority || "Priority not set"}
                        </span>
                      </div>

                      <div className="roadmap-skill-heading">
                        <h3>{skill.name}</h3>

                        <label className="roadmap-complete-label">
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() =>
                              toggleSkillCompletion(skill.name)
                            }
                          />
                          <span>
                            {isCompleted ? "Completed" : "Mark Complete"}
                          </span>
                        </label>
                      </div>

                      <p>{skill.action}</p>

                      {skill.project && (
                        <div className="roadmap-project">
                          <strong>Practice Project</strong>
                          <p>{skill.project}</p>
                        </div>
                      )}

                      {skill.resource && (
                        <a
                          className="roadmap-resource-link"
                          href={skill.resource}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Learning Resource ↗
                        </a>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export default Roadmap;
