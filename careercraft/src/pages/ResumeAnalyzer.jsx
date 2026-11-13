
import { useState } from "react";
import { analyzeResume } from "../services/resumeService";
import "./ResumeAnalyzer.css";

function ResumeAnalyzer() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    setError("");
    setResult(null);

    if (!file) {
      setResumeFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setResumeFile(null);
      event.target.value = "";
      setError("Please upload a PDF or DOCX resume file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeFile(null);
      event.target.value = "";
      setError("Resume file size cannot exceed 5 MB.");
      return;
    }

    setResumeFile(file);
  }

  async function handleAnalyze(event) {
    event.preventDefault();

    setError("");
    setResult(null);

    const description = jobDescription.trim();

    if (!resumeFile) {
      setError("Please upload your resume.");
      return;
    }

    if (description.length < 50) {
      setError("Job description must contain at least 50 characters.");
      return;
    }

    if (description.length > 15000) {
      setError("Job description cannot exceed 15,000 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await analyzeResume(resumeFile, description);

      if (!response?.success || !response?.data?.analysis) {
        throw new Error(
          response?.message || "Resume analysis could not be completed."
        );
      }

      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to analyze your resume. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function renderList(items, variant = "default") {
    if (!Array.isArray(items) || items.length === 0) {
      return (
        <p className="resume-analyzer-empty">
          {variant === "missing"
            ? "No missing items identified."
            : "None identified."}
        </p>
      );
    }

    return (
      <ul className={`resume-analyzer-list ${variant}`}>
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>
            <span className="resume-analyzer-list-icon" aria-hidden="true">
              {variant === "matched"
                ? "✓"
                : variant === "missing"
                  ? "−"
                  : variant === "strength"
                    ? "✓"
                    : "•"}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  function getScoreLabel(score) {
    if (score >= 80) return "Strong match";
    if (score >= 60) return "Moderate match";
    if (score >= 40) return "Needs improvement";
    return "Low match";
  }

  function renderScoreBar(label, score, description) {
    const safeScore = Math.min(100, Math.max(0, Number(score) || 0));

    return (
      <div className="resume-analyzer-score-item">
        <div className="resume-analyzer-score-heading">
          <div>
            <h4>{label}</h4>
            <p>{description}</p>
          </div>

          <strong>{safeScore}%</strong>
        </div>

        <progress
          className="resume-analyzer-progress"
          value={safeScore}
          max="100"
          aria-label={`${label}: ${safeScore}%`}
        >
          {safeScore}%
        </progress>
      </div>
    );
  }

  const analysis = result?.analysis;

  const matchedSkills = analysis?.matchedSkills || [];
  const missingSkills = analysis?.missingSkills || [];
  const detectedSections = analysis?.detectedSections || [];
  const missingSections = analysis?.missingSections || [];
  const strengths = analysis?.strengths || [];
  const suggestions = analysis?.suggestions || [];

  const overallScore = Math.min(
    100,
    Math.max(0, Number(analysis?.overallScore) || 0)
  );

  return (
    <>

      <main className="resume-analyzer-page">
        <div className="resume-analyzer-container">
          <header className="resume-analyzer-header">
            <span className="resume-analyzer-eyebrow">
              CAREERCRAFT PK · CAREER TOOLS
            </span>

            <h1>ATS Resume Analyzer</h1>

            <p className="resume-analyzer-description">
              Compare your resume with a job description, identify relevant
              skills, and discover opportunities to improve your application.
            </p>
          </header>

          {/* Resume Upload Form */}
          <section className="resume-analyzer-form-card">
            <div className="resume-analyzer-section-heading">
              <div>
                <span className="resume-analyzer-step">STEP 01</span>
                <h2>Upload your resume</h2>
                <p>Provide your resume and the job description.</p>
              </div>
            </div>

            <form onSubmit={handleAnalyze}>
              <div className="resume-analyzer-field">
                <label htmlFor="resumeFile">
                  Resume file <span>*</span>
                </label>

                <input
                  id="resumeFile"
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                />

                <small>PDF or DOCX · Maximum file size: 5 MB</small>

                {resumeFile && (
                  <p className="resume-analyzer-file-name">
                    Selected file: {resumeFile.name}
                  </p>
                )}
              </div>

              <div className="resume-analyzer-field">
                <label htmlFor="resumeJobDescription">
                  Job description <span>*</span>
                </label>

                <textarea
                  id="resumeJobDescription"
                  rows={8}
                  minLength={50}
                  maxLength={15000}
                  placeholder="Paste the complete job description here..."
                  value={jobDescription}
                  onChange={(event) => {
                    setJobDescription(event.target.value);
                    setError("");
                    setResult(null);
                  }}
                  required
                />

                <small>
                  {jobDescription.length.toLocaleString()}/15,000 characters
                  · Minimum 50
                </small>
              </div>

              {error && (
                <p className="resume-analyzer-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="resume-analyzer-submit"
                disabled={loading}
              >
                {loading ? "Analyzing Resume..." : "Analyze My Resume"}
                {!loading && <span aria-hidden="true"> →</span>}
              </button>
            </form>
          </section>

          {/* Analysis Report */}
          {analysis && (
            <section
              className="resume-analyzer-results"
              aria-live="polite"
            >
              <div className="resume-analyzer-report-header">
                <div>
                  <span className="resume-analyzer-eyebrow">
                    ANALYSIS REPORT
                  </span>
                  <h2>Your Resume Assessment</h2>
                  <p>
                    Review your resume's compatibility with the supplied job
                    description.
                  </p>
                </div>

                <span className="resume-analyzer-complete">
                  ✓ Analysis complete
                </span>
              </div>

              <div className="resume-analyzer-result-file">
                <span aria-hidden="true">📄</span>
                <span>{result.fileName}</span>
              </div>

              {/* Overall Score */}
              <div className="resume-analyzer-overall-score">
                <div className="resume-analyzer-overall-content">
                  <div>
                    <span className="resume-analyzer-score-label">
                      OVERALL ATS SCORE
                    </span>

                    <div className="resume-analyzer-score-value">
                      {overallScore}
                      <span>%</span>
                    </div>

                    <span className="resume-analyzer-score-status">
                      {getScoreLabel(overallScore)}
                    </span>
                  </div>

                  <div className="resume-analyzer-score-note">
                    <strong>What this means</strong>
                    <p>
                      This score is an estimated comparison of your resume
                      against the supplied job description using CareerCraft
                      PK's rule-based analysis.
                    </p>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <section className="resume-analyzer-report-section">
                <div className="resume-analyzer-section-heading">
                  <div>
                    <span className="resume-analyzer-step">
                      SCORE BREAKDOWN
                    </span>
                    <h3>Performance overview</h3>
                    <p>Understand how your resume performed in each area.</p>
                  </div>
                </div>

                <div className="resume-analyzer-score-breakdown">
                  {renderScoreBar(
                    "Keyword match",
                    analysis.keywordScore,
                    "Relevant skills found in your resume"
                  )}

                  {renderScoreBar(
                    "Resume structure",
                    analysis.structureScore,
                    "Presence of important resume sections"
                  )}

                  {renderScoreBar(
                    "Readability",
                    analysis.readabilityScore,
                    "Word-count-based readability estimate"
                  )}
                </div>
              </section>

              {/* Summary Statistics */}
              <section className="resume-analyzer-report-section">
                <div className="resume-analyzer-section-heading">
                  <div>
                    <span className="resume-analyzer-step">
                      QUICK SUMMARY
                    </span>
                    <h3>Resume statistics</h3>
                  </div>
                </div>

                <div className="resume-analyzer-stats">
                  <div className="resume-analyzer-stat-card">
                    <strong>{analysis.totalJobSkills ?? 0}</strong>
                    <span>Job skills identified</span>
                  </div>

                  <div className="resume-analyzer-stat-card matched-stat">
                    <strong>{matchedSkills.length}</strong>
                    <span>Matched skills</span>
                  </div>

                  <div className="resume-analyzer-stat-card missing-stat">
                    <strong>{missingSkills.length}</strong>
                    <span>Missing skills</span>
                  </div>

                  <div className="resume-analyzer-stat-card">
                    <strong>{analysis.wordCount ?? 0}</strong>
                    <span>Resume words</span>
                  </div>
                </div>
              </section>

              {/* Skills Comparison */}
              <section className="resume-analyzer-report-section">
                <div className="resume-analyzer-section-heading">
                  <div>
                    <span className="resume-analyzer-step">
                      SKILLS ANALYSIS
                    </span>
                    <h3>Job requirements comparison</h3>
                    <p>
                      See which job-related skills were identified in your
                      resume.
                    </p>
                  </div>
                </div>

                <div className="resume-analyzer-comparison-grid">
                  <div className="resume-analyzer-result-group matched-group">
                    <div className="resume-analyzer-group-heading">
                      <h4>Matched skills</h4>
                      <span>{matchedSkills.length} found</span>
                    </div>

                    {renderList(matchedSkills, "matched")}
                  </div>

                  <div className="resume-analyzer-result-group missing-group">
                    <div className="resume-analyzer-group-heading">
                      <h4>Missing skills</h4>
                      <span>{missingSkills.length} found</span>
                    </div>

                    {renderList(missingSkills, "missing")}
                  </div>
                </div>
              </section>

              {/* Resume Structure */}
              <section className="resume-analyzer-report-section">
                <div className="resume-analyzer-section-heading">
                  <div>
                    <span className="resume-analyzer-step">
                      RESUME STRUCTURE
                    </span>
                    <h3>Section review</h3>
                    <p>
                      Important sections detected and sections you may want
                      to add.
                    </p>
                  </div>
                </div>

                <div className="resume-analyzer-comparison-grid">
                  <div className="resume-analyzer-result-group matched-group">
                    <div className="resume-analyzer-group-heading">
                      <h4>Detected sections</h4>
                      <span>{detectedSections.length} found</span>
                    </div>

                    {renderList(detectedSections, "matched")}
                  </div>

                  <div className="resume-analyzer-result-group missing-group">
                    <div className="resume-analyzer-group-heading">
                      <h4>Sections to consider</h4>
                      <span>{missingSections.length} found</span>
                    </div>

                    {renderList(missingSections, "missing")}
                  </div>
                </div>
              </section>

              {/* Strengths */}
              <section className="resume-analyzer-report-section">
                <div className="resume-analyzer-section-heading">
                  <div>
                    <span className="resume-analyzer-step">
                      POSITIVE FINDINGS
                    </span>
                    <h3>Resume strengths</h3>
                    <p>Positive points identified by the analysis.</p>
                  </div>
                </div>

                <div className="resume-analyzer-result-group strength-group">
                  {renderList(strengths, "strength")}
                </div>
              </section>

              {/* Recommendations */}
              <section className="resume-analyzer-report-section">
                <div className="resume-analyzer-section-heading">
                  <div>
                    <span className="resume-analyzer-step">
                      NEXT STEPS
                    </span>
                    <h3>Recommended improvements</h3>
                    <p>
                      Review these suggestions when preparing your resume.
                    </p>
                  </div>
                </div>

                <div className="resume-analyzer-result-group suggestion-group">
                  {renderList(suggestions, "suggestion")}
                </div>
              </section>

              {/* Disclaimer */}
              <div className="resume-analyzer-disclaimer">
                <strong>Important note about your ATS score</strong>
                <p>
                  CareerCraft PK uses a rule-based scoring method. This is an
                  estimated resume-to-job-description comparison, not an
                  official score from an employer's ATS platform. A missing
                  skill does not necessarily mean you are unqualified. Only
                  include skills and experience that you genuinely have.
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export default ResumeAnalyzer;
