
import { useEffect, useState } from "react";
import {
  getInterviewProgress,
  getInterviewSessions,
  createInterviewSession,
  saveInterviewAnswer,
  completeInterviewSession,
} from "../services/interviewService";
import "./InterviewPreparation.css";

function InterviewPreparation() {
  const [progress, setProgress] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showSetup, setShowSetup] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdSession, setCreatedSession] = useState(null);

  // Practice screen states
  const [isPracticing, setIsPracticing] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [answerResult, setAnswerResult] = useState(null);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [finishingInterview, setFinishingInterview] = useState(false);
  const [completionMessage, setCompletionMessage] = useState("");

  const [setupData, setSetupData] = useState({
    job_role: "React Developer",
    interview_type: "Technical",
    difficulty: "Beginner",
    total_questions: 3,
  });

  const questions = createdSession?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Load dashboard data
  async function refreshDashboard() {
    const [progressResponse, sessionsResponse] = await Promise.all([
      getInterviewProgress(),
      getInterviewSessions(),
    ]);

    setProgress(progressResponse.data);
    setSessions(sessionsResponse.data || []);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [progressResponse, sessionsResponse] =
          await Promise.all([
            getInterviewProgress(),
            getInterviewSessions(),
          ]);

        if (!isMounted) return;

        setProgress(progressResponse.data);
        setSessions(sessionsResponse.data || []);
      } catch (err) {
        console.error("Interview dashboard error:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load interview preparation data."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle interview setup form
  function handleSetupChange(event) {
    const { name, value } = event.target;

    setSetupData((previous) => ({
      ...previous,
      [name]:
        name === "total_questions" ? Number(value) : value,
    }));
  }

  // Start a new interview session
  async function handleStartInterview(event) {
    event.preventDefault();

    try {
      setCreating(true);
      setError("");
      setCompletionMessage("");
      setCreatedSession(null);

      const response = await createInterviewSession(setupData);
      const newSession = response.data;

      setCreatedSession(newSession);
      setCurrentQuestionIndex(0);
      setAnswerText("");
      setAnswerResult(null);
      setShowSetup(false);
      setIsPracticing(true);

      await refreshDashboard();
    } catch (err) {
      console.error("Create interview error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to create interview session."
      );
    } finally {
      setCreating(false);
    }
  }

  // Submit an answer
  async function handleSubmitAnswer(event) {
    event.preventDefault();

    if (!answerText.trim()) {
      setError("Please write your answer before submitting.");
      return;
    }

    if (!currentQuestion || !createdSession?.session?.id) {
      setError("Interview session or question could not be found.");
      return;
    }

    try {
      setSavingAnswer(true);
      setError("");

      const response = await saveInterviewAnswer(
        createdSession.session.id,
        {
          question_id: currentQuestion.id,
          user_answer: answerText.trim(),
        }
      );

      setAnswerResult(response.data);
    } catch (err) {
      console.error("Save interview answer error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save your answer. Please try again."
      );
    } finally {
      setSavingAnswer(false);
    }
  }

  // Move to the next question
  function handleNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((previous) => previous + 1);
      setAnswerText("");
      setAnswerResult(null);
      setError("");
    }
  }

  // Complete the interview
  async function handleFinishInterview() {
    if (!createdSession?.session?.id) {
      setError("Interview session could not be found.");
      return;
    }

    try {
      setFinishingInterview(true);
      setError("");

      await completeInterviewSession(createdSession.session.id);

      setIsPracticing(false);
      setCreatedSession(null);
      setAnswerText("");
      setAnswerResult(null);
      setCurrentQuestionIndex(0);

      setCompletionMessage(
        "Your interview session has been completed successfully."
      );

      await refreshDashboard();
    } catch (err) {
      console.error("Complete interview error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to complete your interview session."
      );
    } finally {
      setFinishingInterview(false);
    }
  }

  // Open interview setup
  function openInterviewSetup() {
    setShowSetup(true);
    setCreatedSession(null);
    setCompletionMessage("");
    setError("");
  }

  // Dashboard statistics from actual API data
  const stats = [
    {
      label: "Total Sessions",
      value: progress?.total_sessions ?? 0,
      icon: "📚",
      description: "Practice sessions created",
    },
    {
      label: "Completed Sessions",
      value: progress?.completed_sessions ?? 0,
      icon: "✓",
      description: "Sessions completed",
    },
    {
      label: "In Progress",
      value: progress?.in_progress_sessions ?? 0,
      icon: "◷",
      description: "Sessions still in progress",
    },
    {
      label: "Questions Answered",
      value: progress?.total_answers ?? 0,
      icon: "✎",
      description: "Answers submitted",
    },
  ];

  // Preparation workspace cards
  const workspaceItems = [
    {
      id: "career-path",
      icon: "🎯",
      status: "Available",
      statusType: "available",
      title: "Career Path",
      description:
        "Begin with a focused preparation path for your selected developer role.",
      detailTitle: "React Developer",
      detailText: "Your current preparation role",
      action: "Start Preparation",
      available: true,
    },
    {
      id: "roadmap",
      icon: "🗺️",
      status: "Coming Soon",
      statusType: "planned",
      title: "Preparation Roadmap",
      description:
        "Follow a step-by-step learning path from JavaScript fundamentals to advanced React concepts.",
      detailTitle: "Structured learning stages",
      detailText: "Topic-wise preparation and progress",
    },
    {
      id: "learning-center",
      icon: "📖",
      status: "Coming Soon",
      statusType: "planned",
      title: "Learning Center",
      description:
        "Understand important concepts with explanations, practical examples, and knowledge checks.",
      detailTitle: "Learn before you practice",
      detailText: "Concepts, examples, and revision",
    },
    {
      id: "question-practice",
      icon: "💬",
      status: "Available",
      statusType: "available",
      title: "Question Practice",
      description:
        "Answer role-specific technical and HR questions and review suggested answers.",
      detailTitle: "Technical and HR practice",
      detailText: "Beginner, Intermediate, and Advanced",
      action: "Practice Questions",
      available: true,
    },
    {
      id: "coding-practice",
      icon: "💻",
      status: "Coming Soon",
      statusType: "planned",
      title: "Coding Practice",
      description:
        "Strengthen problem-solving skills with programming challenges and test cases.",
      detailTitle: "Practical coding challenges",
      detailText: "Problems, test cases, and solutions",
    },
    {
      id: "mock-interview",
      icon: "🎙️",
      status: "Coming Soon",
      statusType: "planned",
      title: "Mock Interview",
      description:
        "Experience a structured interview session with questions presented one at a time.",
      detailTitle: "Interview simulation",
      detailText: "Technical and HR interview sessions",
    },
    {
      id: "performance-reports",
      icon: "📊",
      status: "Coming Soon",
      statusType: "planned",
      title: "Performance Reports",
      description:
        "Review your practice activity and identify topics that need more attention.",
      detailTitle: "Progress and answer history",
      detailText: "Based on your actual practice data",
    },
  ];

  // Loading screen
  if (loading) {
    return (
      <main className="interview-page">
        <div className="interview-container">
          <p className="interview-loading">
            Loading your interview dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="interview-page">
      <div className="interview-container">

        {/* Dashboard Hero */}
        {!isPracticing && (
          <section className="interview-hero">
            <div className="interview-hero-content">
              <span className="interview-eyebrow">
                CAREERCRAFT PK <span>·</span> INTERVIEW STUDIO
              </span>

              <h1>
                Prepare with <span>confidence.</span>
              </h1>

              <p>
                Practice role-specific interview questions, improve
                your answers, and track your preparation progress
                in one place.
              </p>

              <button
                type="button"
                className="interview-primary-button"
                onClick={openInterviewSetup}
              >
                Start New Practice <span>→</span>
              </button>

              <div className="interview-hero-note">
                <span className="interview-hero-note-icon">✓</span>
                <span>Build confidence, one question at a time</span>
              </div>
            </div>

            <div className="interview-hero-visual">
              <div className="interview-visual-circle">
                <span>💼</span>
              </div>

              <div className="interview-floating-note">
                <strong>Build confidence</strong>
                <span>One question at a time</span>
              </div>
            </div>
          </section>
        )}

        {/* Error Message */}
        {error && (
          <div className="interview-error" role="alert">
            {error}
          </div>
        )}

        {/* Completion Message */}
        {completionMessage && !isPracticing && (
          <div className="interview-success">
            <h3>Interview Completed!</h3>
            <p>{completionMessage}</p>
          </div>
        )}

        {/* Interview Setup Form */}
        {showSetup && !isPracticing && (
          <section className="interview-setup">
            <div className="interview-section-heading">
              <div>
                <span className="interview-eyebrow">
                  NEW PRACTICE
                </span>

                <h2>Set Up Your Interview</h2>

                <p>
                  Choose your interview preferences before starting.
                </p>
              </div>

              <button
                type="button"
                className="interview-close-button"
                onClick={() => setShowSetup(false)}
              >
                ✕
              </button>
            </div>

            <form
              className="interview-setup-form"
              onSubmit={handleStartInterview}
            >
              <div className="interview-form-group">
                <label htmlFor="job_role">Job Role</label>

                <select
                  id="job_role"
                  name="job_role"
                  value={setupData.job_role}
                  onChange={handleSetupChange}
                >
                  <option value="React Developer">
                    React Developer
                  </option>
                </select>
              </div>

              <div className="interview-form-group">
                <label htmlFor="interview_type">
                  Interview Type
                </label>

                <select
                  id="interview_type"
                  name="interview_type"
                  value={setupData.interview_type}
                  onChange={handleSetupChange}
                >
                  <option value="Technical">Technical</option>
                  <option value="HR">HR</option>
                </select>
              </div>

              <div className="interview-form-group">
                <label htmlFor="difficulty">
                  Difficulty Level
                </label>

                <select
                  id="difficulty"
                  name="difficulty"
                  value={setupData.difficulty}
                  onChange={handleSetupChange}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="interview-form-group">
                <label htmlFor="total_questions">
                  Number of Questions
                </label>

                <select
                  id="total_questions"
                  name="total_questions"
                  value={setupData.total_questions}
                  onChange={handleSetupChange}
                >
                  <option value={1}>1 Question</option>
                  <option value={2}>2 Questions</option>
                  <option value={3}>3 Questions</option>
                </select>
              </div>

              <div className="interview-form-actions">
                <button
                  type="submit"
                  className="interview-primary-button"
                  disabled={creating}
                >
                  {creating ? "Creating Session..." : "Start Interview"}
                  {!creating && <span>→</span>}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Question Practice Screen */}
        {isPracticing && currentQuestion && (
          <section className="interview-practice">
            <div className="interview-practice-header">
              <div>
                <span className="interview-eyebrow">
                  INTERVIEW IN PROGRESS
                </span>

                <h2>{createdSession.session.job_role}</h2>

                <p>
                  {createdSession.session.interview_type} ·{" "}
                  {createdSession.session.difficulty}
                </p>
              </div>

              <button
                type="button"
                className="interview-close-button"
                onClick={handleFinishInterview}
                disabled={finishingInterview}
              >
                {finishingInterview ? "Finishing..." : "Finish Interview"}
              </button>
            </div>

            <div className="interview-question-progress">
              <div className="interview-question-progress-info">
                <span>
                  Question {currentQuestionIndex + 1} of{" "}
                  {questions.length}
                </span>

                <strong>
                  {Math.round(
                    ((currentQuestionIndex + 1) / questions.length) * 100
                  )}%
                </strong>
              </div>

              <div className="interview-progress-track">
                <div
                  className="interview-progress-fill"
                  style={{
                    width: `${
                      ((currentQuestionIndex + 1) / questions.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="interview-question-card">
              <span className="interview-question-label">
                QUESTION {currentQuestionIndex + 1}
              </span>

              <h3>{currentQuestion.question}</h3>

              <form onSubmit={handleSubmitAnswer}>
                <div className="interview-form-group">
                  <label htmlFor="interview-answer">
                    Your Answer
                  </label>

                  <textarea
                    id="interview-answer"
                    rows={7}
                    value={answerText}
                    onChange={(event) =>
                      setAnswerText(event.target.value)
                    }
                    placeholder="Write your answer here. Explain your understanding and include examples where possible..."
                    disabled={savingAnswer || Boolean(answerResult)}
                  />
                </div>

                {!answerResult && (
                  <button
                    type="submit"
                    className="interview-primary-button"
                    disabled={savingAnswer || !answerText.trim()}
                  >
                    {savingAnswer ? "Saving Answer..." : "Submit Answer"}
                    {!savingAnswer && <span>→</span>}
                  </button>
                )}
              </form>
            </div>

            {/* Feedback after answer submission */}
            {answerResult && (
              <div className="interview-feedback">
                <div className="interview-feedback-section">
                  <span className="interview-eyebrow">
                    YOUR FEEDBACK
                  </span>

                  <h3>Answer Review</h3>

                  <p>{answerResult.feedback}</p>

                  <small>
                    Feedback is based on answer length and is not an
                    AI-generated evaluation.
                  </small>
                </div>

                <div className="interview-suggested-answer">
                  <h3>Suggested Answer</h3>
                  <p>{currentQuestion.suggested_answer}</p>
                </div>

                {currentQuestion.explanation && (
                  <div className="interview-explanation">
                    <h3>Explanation</h3>
                    <p>{currentQuestion.explanation}</p>
                  </div>
                )}

                <div className="interview-practice-actions">
                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      className="interview-primary-button"
                      onClick={handleNextQuestion}
                    >
                      Next Question <span>→</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="interview-primary-button"
                      onClick={handleFinishInterview}
                      disabled={finishingInterview}
                    >
                      {finishingInterview
                        ? "Completing..."
                        : "Complete Interview"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Interview Studio Dashboard */}
        {!isPracticing && (
          <>
            {/* Statistics */}
            <section className="interview-stats-section">
              <div className="interview-stats-heading">
                <div>
                  <span className="interview-eyebrow">
                    YOUR PROGRESS
                  </span>
                  <h2>Preparation Overview</h2>
                </div>
              </div>

              <div className="interview-stats-grid">
                {stats.map((stat, index) => (
                  <article
                    className="interview-stat-card"
                    key={stat.label}
                  >
                    <div
                      className={`interview-stat-icon interview-stat-icon-${index + 1}`}
                    >
                      {stat.icon}
                    </div>

                    <div className="interview-stat-content">
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                      <small>{stat.description}</small>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Preparation Workspace */}
            <section className="interview-section">
              <div className="interview-section-heading">
                <div>
                  <span className="interview-eyebrow">
                    YOUR LEARNING SPACE
                  </span>

                  <h2>Preparation Workspace</h2>

                  <p>
                    Build your interview skills through a structured
                    preparation journey.
                  </p>
                </div>
              </div>

              <div className="interview-workspace-grid">
                {workspaceItems.map((item) => (
                  <article
                    className={`interview-workspace-card ${
                      item.available ? "interview-card-available" : "interview-card-planned"
                    }`}
                    key={item.id}
                  >
                    <div className="interview-workspace-card-top">
                      <span className="interview-workspace-icon">
                        {item.icon}
                      </span>

                      <span
                        className={`interview-feature-status ${item.statusType}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h3>{item.title}</h3>

                    <p>{item.description}</p>

                    <div className="interview-workspace-detail">
                      <strong>{item.detailTitle}</strong>
                      <span>{item.detailText}</span>
                    </div>

                    {item.available && (
                      <button
                        type="button"
                        className="interview-workspace-link"
                        onClick={openInterviewSetup}
                      >
                        {item.action} <span>→</span>
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </section>

            {/* Recent Interview Sessions */}
            <section className="interview-section interview-recent-section">
              <div className="interview-section-heading">
                <div>
                  <span className="interview-eyebrow">
                    YOUR PRACTICE
                  </span>

                  <h2>Recent Interview Sessions</h2>

                  <p>
                    Review your previous interview preparation sessions.
                  </p>
                </div>
              </div>

              {sessions.length === 0 ? (
                <div className="interview-empty-state">
                  <div className="interview-empty-icon">📋</div>

                  <h3>No practice sessions yet</h3>

                  <p>
                    Start your first interview practice session to
                    begin tracking your preparation.
                  </p>

                  <button
                    type="button"
                    className="interview-primary-button"
                    onClick={openInterviewSetup}
                  >
                    Start Your First Practice <span>→</span>
                  </button>
                </div>
              ) : (
                <div className="interview-session-list">
                  {sessions.map((session) => (
                    <article
                      className="interview-session-card"
                      key={session.id}
                    >
                      <div className="interview-session-main">
                        <div className="interview-session-icon">
                          💼
                        </div>

                        <div className="interview-session-info">
                          <h3>{session.job_role}</h3>

                          <p>
                            {session.interview_type} ·{" "}
                            {session.difficulty}
                          </p>

                          <span>
                            {session.completed_questions} of{" "}
                            {session.total_questions} questions answered
                          </span>
                        </div>
                      </div>

                      <span
                        className={`interview-status interview-status-${session.status}`}
                      >
                        {session.status.replace("_", " ")}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default InterviewPreparation;
