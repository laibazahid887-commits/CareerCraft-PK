
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { analyzeJobDescription } from "../services/jobAnalyzerService";
import { createApplication } from "../services/jobApplicationService";
import "./JobAnalyzer.css";

const careerSkillStorageKeys = [
  "frontend",
  "backend",
  "uiux",
  "graphic",
  "marketing",
  "business",
  "education",
  "technicalTraining",
];

const classificationOrder = {
  Required: 1,
  Preferred: 2,
  Unspecified: 3,
};

function getAllSavedSkills() {
  const savedSkills = new Set();

  careerSkillStorageKeys.forEach((careerKey) => {
    try {
      const stored = localStorage.getItem(
        `careerCraftSkills_${careerKey}`
      );
      const parsed = stored ? JSON.parse(stored) : [];

      if (Array.isArray(parsed)) {
        parsed.forEach((skill) => {
          if (typeof skill === "string") {
            savedSkills.add(skill);
          }
        });
      }
    } catch {
      // Ignore invalid browser storage.
    }
  });

  return [...savedSkills];
}

function normalizeSkillName(name) {
  const normalized = name.trim().toLowerCase();

  if (normalized === "express") {
    return "express.js";
  }

  return normalized;
}

function skillsMatch(savedSkill, requiredSkill) {
  const saved = normalizeSkillName(savedSkill);
  const required = normalizeSkillName(requiredSkill);

  if (saved === required) return true;

  return (
    saved === "git and github" &&
    ["git", "github"].includes(required)
  );
}

function saveCareerActivity(activity) {
  try {
    const stored = JSON.parse(
      localStorage.getItem("careerCraftRecentActivity") || "[]"
    );

    const activities = Array.isArray(stored) ? stored : [];

    const newActivity = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "job_analysis",
      title: activity.jobTitle,
      company: activity.company,
      skillCount: activity.skillCount,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(
      "careerCraftRecentActivity",
      JSON.stringify([newActivity, ...activities].slice(0, 10))
    );
  } catch {
    // Analysis should still work if storage is unavailable.
  }
}

function JobAnalyzer() {
  const navigate = useNavigate();

  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  const [savingToTracker, setSavingToTracker] = useState(false);
  const [trackerMessage, setTrackerMessage] = useState("");
  const [trackerError, setTrackerError] = useState("");
  const [savedApplicationKey, setSavedApplicationKey] = useState("");

  const currentApplicationKey =
    `${jobTitle.trim().toLowerCase()}::${company.trim().toLowerCase()}`;

  const isCurrentApplicationSaved =
    Boolean(company.trim()) &&
    savedApplicationKey === currentApplicationKey;

  function handleAnalyze(event) {
    event.preventDefault();

    setError("");
    setAnalysis(null);
    setTrackerMessage("");
    setTrackerError("");

    const description = jobDescription.trim();

    if (description.length < 3) {
      setError("Please enter a job description or skills to analyze.");
      return;
    }

    try {
      const result = analyzeJobDescription(description);

      const detectedSkills = Array.isArray(result?.detectedSkills)
        ? result.detectedSkills
        : [];

      if (detectedSkills.length === 0) {
        setError(
          "No recognized skills were found. Try entering skills such as React, JavaScript, HTML, or CSS."
        );
        return;
      }

      const savedSkills = getAllSavedSkills();

      const relevantSkills = detectedSkills.filter(
        (skill) => skill.classification !== "Not required"
      );

      const matchedSkills = relevantSkills.filter((skill) =>
        savedSkills.some((saved) => skillsMatch(saved, skill.name))
      );

      const missingSkills = relevantSkills.filter(
        (skill) =>
          !savedSkills.some((saved) => skillsMatch(saved, skill.name))
      );

      const prioritizedMissingSkills = [...missingSkills].sort(
        (a, b) =>
          (classificationOrder[a.classification] || 4) -
          (classificationOrder[b.classification] || 4)
      );

      setAnalysis({
        detectedSkills,
        matchedSkills,
        missingSkills,
        prioritizedMissingSkills,
        hasSavedSkills: savedSkills.length > 0,
        totalSkills: result.totalSkills ?? detectedSkills.length,
      });

      saveCareerActivity({
        jobTitle: jobTitle.trim(),
        company: company.trim(),
        skillCount: result.totalSkills ?? detectedSkills.length,
      });
    } catch {
      setError("Something went wrong during analysis. Please try again.");
    }
  }


async function handleSaveToTracker() {
  const title = jobTitle.trim();
  const companyName = company.trim();
  const description = jobDescription.trim();

  setTrackerMessage("");
  setTrackerError("");

  if (!analysis || !title) {
    setTrackerError("Please analyze a job before saving it.");
    return;
  }

  if (!companyName) {
    setTrackerError(
      "Please enter the company name before saving this job."
    );
    return;
  }

  const applicationKey =
    `${title.toLowerCase()}::${companyName.toLowerCase()}`;

  if (savedApplicationKey === applicationKey) {
    setTrackerMessage(
      "This job has already been saved during this session."
    );
    return;
  }

  const formatSkills = (skills) =>
    skills.length > 0
      ? skills.map((skill) => skill.name).join(", ")
      : "None identified";

  const matchedSkillsText = formatSkills(analysis.matchedSkills);
  const missingSkillsText = formatSkills(analysis.missingSkills);

  const priorityText =
    analysis.prioritizedMissingSkills.length > 0
      ? analysis.prioritizedMissingSkills
          .map((skill) => {
            const priority =
              skill.classification === "Required"
                ? "High"
                : skill.classification === "Preferred"
                ? "Medium"
                : "Low";

            return `${priority} — ${skill.name} (${skill.classification})`;
          })
          .join("\n")
      : "No skill gaps identified";

  const notes = [
    "Saved from Job Analyzer",
    "",
    "JOB DESCRIPTION:",
    description,
    "",
    "RECOGNIZED SKILLS:",
    formatSkills(analysis.detectedSkills),
    "",
    "MATCHED SKILLS:",
    matchedSkillsText,
    "",
    "SKILLS TO LEARN:",
    missingSkillsText,
    "",
    "PREPARATION PRIORITIES:",
    priorityText,
  ].join("\n");

  if (notes.length > 10000) {
    setTrackerError(
      "The job description and analysis are too long to save. Shorten the description and try again."
    );
    return;
  }

  setSavingToTracker(true);

  try {
    await createApplication({
      company_name: companyName,
      job_title: title,
      job_url: "",
      status: "Saved",
      notes,
    });

    setSavedApplicationKey(applicationKey);
    setTrackerMessage(
      "Job and skill analysis saved successfully to your tracker."
    );
  } catch (err) {
    setTrackerError(
      err.response?.data?.message ||
        "Could not save this job. Please try again."
    );
  } finally {
    setSavingToTracker(false);
  }
}


  function handleGenerateRoadmap() {
    if (!analysis || analysis.missingSkills.length === 0) return;

    const roadmapSkills = analysis.prioritizedMissingSkills.map(
      (skill) => ({
        ...skill,
        priority:
          skill.classification === "Required"
            ? "High"
            : skill.classification === "Preferred"
            ? "Medium"
            : "Low",
      })
    );

    const roadmapData = {
      missingSkills: roadmapSkills,
      jobTitle: jobTitle.trim(),
      company: company.trim(),
    };

    sessionStorage.setItem(
      "careerCraftRoadmap",
      JSON.stringify(roadmapData)
    );

    navigate("/roadmap", { state: roadmapData });
  }

  function renderSkillList(skills, className) {
    return (
      <div className="job-analyzer-skill-list">
        {skills.map((skill) => (
          <span className={className} key={skill.name}>
            {skill.name}
          </span>
        ))}
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="job-analyzer-page">
        <div className="job-analyzer-container">
          <h1>Job Analyzer</h1>
          <p>Compare job requirements with your selected skills.</p>

          <section className="job-analyzer-form-card">
            <form onSubmit={handleAnalyze}>
              <div className="job-analyzer-field-grid">
                <div className="job-analyzer-field">
                  <label htmlFor="jobTitle">Job Title *</label>
                  <input
                    id="jobTitle"
                    type="text"
                    placeholder="e.g. Frontend Developer"
                    value={jobTitle}
                    onChange={(event) => {
                      setJobTitle(event.target.value);
                      setTrackerMessage("");
                      setTrackerError("");
                    }}
                    required
                  />
                </div>

                <div className="job-analyzer-field">
                  <label htmlFor="company">Company (optional)</label>
                  <input
                    id="company"
                    type="text"
                    placeholder="Company name"
                    value={company}
                    onChange={(event) => {
                      setCompany(event.target.value);
                      setTrackerMessage("");
                      setTrackerError("");
                    }}
                  />
                </div>
              </div>

              <div className="job-analyzer-field">
                <label htmlFor="jobDescription">Job Description *</label>
                <textarea
                  id="jobDescription"
                  placeholder="Paste the job description or enter skills such as React, JavaScript, HTML..."
                  value={jobDescription}
                  onChange={(event) => {
                    setJobDescription(event.target.value);
                    setTrackerMessage("");
                    setTrackerError("");
                  }}
                  rows={7}
                  minLength={3}
                  required
                />
              </div>

              {error && (
                <p className="job-analyzer-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="job-analyzer-submit">
                Analyze Job
              </button>
            </form>
          </section>

          {analysis && (
            <section
              className="job-analyzer-results"
              aria-live="polite"
            >
              <h2>Analysis Results</h2>

              <p>
                <strong>Job:</strong> {jobTitle}
                {company.trim() ? ` · ${company.trim()}` : ""}
              </p>

              <div className="job-analyzer-match-summary">
                <div>
                  <strong>{analysis.totalSkills}</strong>
                  <span>Skills Found</span>
                </div>
                <div>
                  <strong>{analysis.matchedSkills.length}</strong>
                  <span>Matched Skills</span>
                </div>
                <div>
                  <strong>{analysis.missingSkills.length}</strong>
                  <span>Skill Gaps</span>
                </div>
              </div>

              <div className="job-analyzer-match-group">
                <h3>Matched Skills</h3>
                {analysis.matchedSkills.length > 0 ? (
                  renderSkillList(
                    analysis.matchedSkills,
                    "job-analyzer-match-tag"
                  )
                ) : (
                  <p>No selected skills matched the requirements.</p>
                )}
              </div>

              <div className="job-analyzer-match-group">
                <h3>Skills to Learn</h3>

                {!analysis.hasSavedSkills && (
                  <p className="job-analyzer-results-note">
                    Select your current skills on the Skill Gap page for
                    a more personalized comparison. Unselected skills
                    are not necessarily skills you don't know.
                  </p>
                )}

                {analysis.missingSkills.length > 0 ? (
                  ["Required", "Preferred", "Unspecified"].map(
                    (classification) => {
                      const skills =
                        analysis.prioritizedMissingSkills.filter(
                          (skill) =>
                            skill.classification === classification
                        );

                      if (skills.length === 0) return null;

                      const priority =
                        classification === "Required"
                          ? "High"
                          : classification === "Preferred"
                          ? "Medium"
                          : "Low";

                      return (
                        <div
                          className="job-analyzer-priority-group"
                          key={classification}
                        >
                          <h4>
                            {priority} Priority — {classification}
                          </h4>
                          {renderSkillList(
                            skills,
                            "job-analyzer-missing-tag"
                          )}
                        </div>
                      );
                    }
                  )
                ) : (
                  <p>
                    All applicable recognized skills match your
                    selected skills.
                  </p>
                )}
              </div>

              <div className="job-analyzer-tracker-actions">
                <button
                  type="button"
                  className="job-analyzer-tracker-button"
                  onClick={handleSaveToTracker}
                  disabled={
                    savingToTracker || isCurrentApplicationSaved
                  }
                >
                  {savingToTracker
                    ? "Saving..."
                    : isCurrentApplicationSaved
                    ? "Saved to Tracker ✓"
                    : "Save to Tracker"}
                </button>

                {trackerMessage && (
                  <p
                    role="status"
                    className="job-analyzer-tracker-success"
                  >
                    {trackerMessage}
                  </p>
                )}

                {trackerError && (
                  <p role="alert" className="job-analyzer-error">
                    {trackerError}
                  </p>
                )}
              </div>

              {analysis.missingSkills.length > 0 && (
                <button
                  type="button"
                  className="job-analyzer-roadmap-button"
                  onClick={handleGenerateRoadmap}
                >
                  Generate Roadmap →
                </button>
              )}

              <p className="job-analyzer-results-note">
                Review the employer's original job description to confirm
                its requirements.
              </p>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export default JobAnalyzer;
