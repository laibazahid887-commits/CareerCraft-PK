
import { useCallback, useEffect, useState } from "react";
import {
  createApplication,
  deleteApplication,
  getApplications,
  updateApplication,
} from "../services/jobApplicationService";
import "./JobApplicationTracker.css";

const STATUSES = [
  "Saved",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

const ANALYSIS_SECTIONS = [
  "JOB DESCRIPTION:",
  "RECOGNIZED SKILLS:",
  "MATCHED SKILLS:",
  "SKILLS TO LEARN:",
  "PREPARATION PRIORITIES:",
];

const EMPTY_FORM = {
  company_name: "",
  job_title: "",
  job_url: "",
  application_date: new Date().toLocaleDateString("en-CA"),
  status: "Applied",
  interview_date: "",
  notes: "",
};

function formatDate(value) {
  if (!value) return "Not set";

  const date = String(value).slice(0, 10);
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) return date;

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  ).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

// Reads structured reports saved from Job Analyzer.
function parseAnalyzerNotes(notes) {
  if (typeof notes !== "string" || !notes.trim()) {
    return null;
  }

  const marker = "Saved from Job Analyzer";

  if (!notes.startsWith(marker)) {
    return null;
  }

  const sections = {};
  let currentSection = "";

  notes.split(/\r?\n/).forEach((line) => {
    const trimmedLine = line.trim();

    const matchingSection = ANALYSIS_SECTIONS.find(
      (section) => section === trimmedLine
    );

    if (matchingSection) {
      currentSection = matchingSection.replace(/:$/, "");
      sections[currentSection] = [];
      return;
    }

    if (currentSection) {
      sections[currentSection].push(line);
    }
  });

  const getSection = (name) =>
    (sections[name] || []).join("\n").trim();

  const report = {
    jobDescription: getSection("JOB DESCRIPTION"),
    recognizedSkills: getSection("RECOGNIZED SKILLS"),
    matchedSkills: getSection("MATCHED SKILLS"),
    skillsToLearn: getSection("SKILLS TO LEARN"),
    priorities: getSection("PREPARATION PRIORITIES"),
  };

  // Support older Job Analyzer notes that stored everything
  // on one line instead of using separate sections.
  if (
    !report.jobDescription &&
    !report.recognizedSkills &&
    !report.matchedSkills &&
    !report.skillsToLearn &&
    !report.priorities
  ) {
    const legacyDescription = notes.match(
      /Job description:\s*([\s\S]*)/i
    );

    if (legacyDescription) {
      report.jobDescription = legacyDescription[1].trim();
    }
  }

  return report;
}

function AnalysisSection({ title, content }) {
  if (!content) return null;

  return (
    <section className="tracker-analysis-section">
      <h4>{title}</h4>
      <p>{content}</p>
    </section>
  );
}

function JobApplicationTracker() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getApplications();

      setApplications(
        Array.isArray(response?.data) ? response.data : []
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const counts = {
    total: applications.length,
    applied: applications.filter(
      (app) => app.status === "Applied"
    ).length,
    interviews: applications.filter(
      (app) => app.status === "Interview"
    ).length,
    offers: applications.filter(
      (app) => app.status === "Offer"
    ).length,
  };

  const visibleApplications =
    filter === "All"
      ? applications
      : applications.filter((app) => app.status === filter);

  function openNewForm() {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function openEditForm(application) {
    setEditingId(application.id);

    setFormData({
      company_name: application.company_name || "",
      job_title: application.job_title || "",
      job_url: application.job_url || "",
      application_date: application.application_date
        ? String(application.application_date).slice(0, 10)
        : "",
      status: application.status || "Applied",
      interview_date: application.interview_date
        ? String(application.interview_date).slice(0, 10)
        : "",
      notes: application.notes || "",
    });

    setError("");
    setNotice("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const payload = {
      company_name: formData.company_name.trim(),
      job_title: formData.job_title.trim(),
      job_url: formData.job_url.trim() || null,
      application_date: formData.application_date || null,
      status: formData.status,
      interview_date: formData.interview_date || null,
      notes: formData.notes.trim() || null,
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await updateApplication(editingId, payload);
        setNotice("Application updated successfully.");
      } else {
        await createApplication(payload);
        setNotice("Application added successfully.");
      }

      closeForm();
      await loadApplications();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(application) {
    const confirmed = window.confirm(
      `Delete the application for ${application.job_title} at ${application.company_name}?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");
    setDeletingId(application.id);

    try {
      await deleteApplication(application.id);

      setApplications((current) =>
        current.filter((app) => app.id !== application.id)
      );

      setNotice("Application deleted successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleStatusChange(application, status) {
    if (status === application.status) return;

    setError("");
    setNotice("");

    try {
      const response = await updateApplication(
        application.id,
        { status }
      );

      if (response?.data) {
        setApplications((current) =>
          current.map((app) =>
            app.id === application.id ? response.data : app
          )
        );
      } else {
        await loadApplications();
      }

      setNotice("Application status updated.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function renderApplicationNotes(notes) {
    if (!notes) return null;

    const report = parseAnalyzerNotes(notes);

    if (!report) {
      return (
        <p className="tracker-application-notes">
          {notes}
        </p>
      );
    }

    const hasSections = Object.values(report).some(Boolean);

    if (!hasSections) {
      return (
        <p className="tracker-application-notes">
          {notes}
        </p>
      );
    }

    return (
      <details className="tracker-analysis-report">
        <summary>View Job Analysis &amp; Skill Gaps</summary>

        <div className="tracker-analysis-content">
          <AnalysisSection
            title="Job Description"
            content={report.jobDescription}
          />

          <AnalysisSection
            title="Recognized Skills"
            content={report.recognizedSkills}
          />

          <AnalysisSection
            title="Matched Skills"
            content={report.matchedSkills}
          />

          <AnalysisSection
            title="Skills to Learn"
            content={report.skillsToLearn}
          />

          <AnalysisSection
            title="Preparation Priorities"
            content={report.priorities}
          />
        </div>
      </details>
    );
  }

  return (
    <main className="job-tracker-page">
      <div className="job-tracker-container">
        <header className="job-tracker-header">
          <div>
            <p className="job-tracker-eyebrow">CAREERCRAFT PK</p>
            <h1>Job Application Tracker</h1>
            <p className="job-tracker-subtitle">
              Keep every application organized and stay on top of your career goals.
            </p>
          </div>

          <button
            type="button"
            className="tracker-primary-button"
            onClick={openNewForm}
          >
            <span aria-hidden="true">+</span> Add application
          </button>
        </header>

        {error && (
          <div
            className="tracker-alert tracker-alert-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            className="tracker-alert tracker-alert-success"
            role="status"
          >
            {notice}
          </div>
        )}

        <section
          className="tracker-stat-grid"
          aria-label="Application statistics"
        >
          <article className="tracker-stat-card">
            <span className="tracker-stat-label">
              Total applications
            </span>
            <strong>{counts.total}</strong>
            <span className="tracker-stat-detail">
              All tracked opportunities
            </span>
          </article>

          <article className="tracker-stat-card">
            <span className="tracker-stat-label">Applied</span>
            <strong>{counts.applied}</strong>
            <span className="tracker-stat-detail">
              Applications submitted
            </span>
          </article>

          <article className="tracker-stat-card">
            <span className="tracker-stat-label">Interviews</span>
            <strong>{counts.interviews}</strong>
            <span className="tracker-stat-detail">
              Interview stage
            </span>
          </article>

          <article className="tracker-stat-card">
            <span className="tracker-stat-label">Offers</span>
            <strong>{counts.offers}</strong>
            <span className="tracker-stat-detail">
              Offers received
            </span>
          </article>
        </section>

        {showForm && (
          <section className="tracker-form-card">
            <div className="tracker-form-heading">
              <div>
                <h2>
                  {editingId !== null
                    ? "Edit application"
                    : "Add a job application"}
                </h2>
                <p>
                  Enter the details of the opportunity you want to track.
                </p>
              </div>

              <button
                type="button"
                className="tracker-close-button"
                onClick={closeForm}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="tracker-form-grid">
                <div className="tracker-field">
                  <label htmlFor="company_name">
                    Company name *
                  </label>
                  <input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    maxLength={150}
                    placeholder="e.g. Company name"
                    required
                  />
                </div>

                <div className="tracker-field">
                  <label htmlFor="job_title">Job title *</label>
                  <input
                    id="job_title"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleChange}
                    maxLength={150}
                    placeholder="e.g. Junior React Developer"
                    required
                  />
                </div>

                <div className="tracker-field">
                  <label htmlFor="job_url">Job posting URL</label>
                  <input
                    id="job_url"
                    name="job_url"
                    type="url"
                    value={formData.job_url}
                    onChange={handleChange}
                    maxLength={2048}
                    placeholder="https://example.com/jobs/123"
                  />
                </div>

                <div className="tracker-field">
                  <label htmlFor="application_date">
                    Application date
                  </label>
                  <input
                    id="application_date"
                    name="application_date"
                    type="date"
                    value={formData.application_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="tracker-field">
                  <label htmlFor="status">Application status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="tracker-field">
                  <label htmlFor="interview_date">
                    Interview date
                  </label>
                  <input
                    id="interview_date"
                    name="interview_date"
                    type="date"
                    value={formData.interview_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="tracker-field tracker-field-full">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    maxLength={10000}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add follow-up reminders, interview details, or other notes..."
                  />
                </div>
              </div>

              <div className="tracker-form-actions">
                <button
                  type="button"
                  className="tracker-secondary-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="tracker-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save changes"
                      : "Save application"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="tracker-applications-section">
          <div className="tracker-list-heading">
            <div>
              <h2>Your applications</h2>
              <p>Manage opportunities and update their progress.</p>
            </div>

            <label className="tracker-filter">
              <span>Filter</span>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="All">All statuses</option>

                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loading ? (
            <div className="tracker-empty-state">
              <p>Loading your applications...</p>
            </div>
          ) : visibleApplications.length === 0 ? (
            <div className="tracker-empty-state">
              <div className="tracker-empty-icon" aria-hidden="true">
                ▤
              </div>

              <h3>
                {filter === "All"
                  ? "Your tracker is ready"
                  : `No ${filter.toLowerCase()} applications`}
              </h3>

              <p>
                {filter === "All"
                  ? "Add your first job application to start tracking your progress."
                  : "Try another status filter or add an application with this status."}
              </p>

              {filter === "All" && (
                <button
                  type="button"
                  className="tracker-primary-button"
                  onClick={openNewForm}
                >
                  Add your first application
                </button>
              )}
            </div>
          ) : (
            <div className="tracker-application-list">
              {visibleApplications.map((application) => (
                <article
                  className="tracker-application-card"
                  key={application.id}
                >
                  <div
                    className="tracker-company-mark"
                    aria-hidden="true"
                  >
                    {(application.company_name || "?")
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="tracker-application-main">
                    <div className="tracker-application-title-row">
                      <div>
                        <h3>{application.job_title}</h3>
                        <p className="tracker-company-name">
                          {application.company_name}
                        </p>
                      </div>

                      <span
                        className={`tracker-status tracker-status-${String(
                          application.status || "Saved"
                        )
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {application.status || "Saved"}
                      </span>
                    </div>

                    <div className="tracker-application-meta">
                      <span>
                        Applied: {formatDate(application.application_date)}
                      </span>

                      {application.interview_date && (
                        <span>
                          Interview: {formatDate(application.interview_date)}
                        </span>
                      )}

                      {application.job_url && (
                        <a
                          href={application.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View job posting ↗
                        </a>
                      )}
                    </div>

                    {renderApplicationNotes(application.notes)}

                    <div className="tracker-card-actions">
                      <label className="tracker-status-update">
                        <span>Update status</span>

                        <select
                          aria-label={`Update status for ${application.job_title} at ${application.company_name}`}
                          value={application.status || "Saved"}
                          onChange={(event) =>
                            handleStatusChange(
                              application,
                              event.target.value
                            )
                          }
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button
                        type="button"
                        className="tracker-text-button"
                        onClick={() => openEditForm(application)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="tracker-text-button tracker-delete-button"
                        onClick={() => handleDelete(application)}
                        disabled={deletingId === application.id}
                      >
                        {deletingId === application.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default JobApplicationTracker;
