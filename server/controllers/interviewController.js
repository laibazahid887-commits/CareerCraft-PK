
const pool = require("../config/db");

const allowedTypes = ["Technical", "HR", "Mixed"];
const allowedDifficulties = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const MAX_QUESTIONS = 20;

// Validate a numeric ID
const isValidId = (id) => /^\d+$/.test(String(id));

// 1. Get interview questions
const getQuestions = async (req, res) => {
  try {
    const {
      job_role,
      interview_type,
      difficulty,
      limit = 20,
    } = req.query;

    if (
      job_role !== undefined &&
      (typeof job_role !== "string" ||
        !job_role.trim() ||
        job_role.trim().length > 120)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid job role",
      });
    }

    if (
      interview_type &&
      !allowedTypes.includes(interview_type)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview type",
        allowedTypes,
      });
    }

    if (
      difficulty &&
      !allowedDifficulties.includes(difficulty)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty",
        allowedDifficulties,
      });
    }

    const questionLimit = Number(limit);

    if (
      !Number.isInteger(questionLimit) ||
      questionLimit < 1 ||
      questionLimit > MAX_QUESTIONS
    ) {
      return res.status(400).json({
        success: false,
        message: `Limit must be between 1 and ${MAX_QUESTIONS}`,
      });
    }

    const values = [];
    const conditions = ["is_active = TRUE"];

    if (job_role) {
      values.push(job_role.trim());
      conditions.push(`job_role = $${values.length}`);
    }

    if (interview_type && interview_type !== "Mixed") {
      values.push(interview_type);
      conditions.push(`interview_type = $${values.length}`);
    }

    if (difficulty) {
      values.push(difficulty);
      conditions.push(`difficulty = $${values.length}`);
    }

    values.push(questionLimit);

    const result = await pool.query(
      `SELECT id, job_role, interview_type, difficulty,
              question, suggested_answer, explanation
       FROM interview_questions
       WHERE ${conditions.join(" AND ")}
       ORDER BY id
       LIMIT $${values.length}`,
      values
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get interview questions failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve interview questions",
    });
  }
};

// 2. Create a practice session
const createSession = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      job_role,
      interview_type,
      difficulty,
      total_questions = 5,
    } = req.body || {};

    if (
      typeof job_role !== "string" ||
      !job_role.trim() ||
      job_role.trim().length > 120
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid job role is required",
      });
    }

    if (!allowedTypes.includes(interview_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview type",
        allowedTypes,
      });
    }

    if (!allowedDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty",
        allowedDifficulties,
      });
    }

    if (
      !Number.isInteger(total_questions) ||
      total_questions < 1 ||
      total_questions > MAX_QUESTIONS
    ) {
      return res.status(400).json({
        success: false,
        message: `Total questions must be between 1 and ${MAX_QUESTIONS}`,
      });
    }

    await client.query("BEGIN");

    const questionResult = await client.query(
      `SELECT id, job_role, interview_type, difficulty,
              question, suggested_answer, explanation
       FROM interview_questions
       WHERE job_role = $1
         AND is_active = TRUE
         AND difficulty = $2
         AND ($3 = 'Mixed' OR interview_type = $3)
       ORDER BY RANDOM()
       LIMIT $4`,
      [
        job_role.trim(),
        difficulty,
        interview_type,
        total_questions,
      ]
    );

    if (!questionResult.rows.length) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "No interview questions found for these filters",
      });
    }

    const sessionResult = await client.query(
      `INSERT INTO interview_sessions (
         user_id,
         job_role,
         interview_type,
         difficulty,
         total_questions
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        req.user.id,
        job_role.trim(),
        interview_type,
        difficulty,
        questionResult.rows.length,
      ]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Interview session created successfully",
      data: {
        session: sessionResult.rows[0],
        questions: questionResult.rows,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create interview session failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create interview session",
    });
  } finally {
    client.release();
  }
};

// 3. Get user's session history
const getSessions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM interview_sessions
       WHERE user_id = $1
       ORDER BY created_at DESC, id DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get interview sessions failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve interview sessions",
    });
  }
};

// 4. Get a particular session
const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID",
      });
    }

    const sessionResult = await pool.query(
      `SELECT *
       FROM interview_sessions
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (!sessionResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found",
      });
    }

    const answersResult = await pool.query(
      `SELECT
         a.id AS answer_id,
         a.question_id,
         a.user_answer,
         a.feedback,
         a.score,
         a.created_at,
         a.updated_at,
         q.question,
         q.suggested_answer,
         q.explanation,
         q.interview_type,
         q.difficulty
       FROM interview_answers a
       JOIN interview_questions q ON q.id = a.question_id
       WHERE a.session_id = $1
       ORDER BY a.id`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        session: sessionResult.rows[0],
        answers: answersResult.rows,
      },
    });
  } catch (error) {
    console.error("Get interview session failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve interview session",
    });
  }
};

// 5. Save or update an answer
const saveAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { question_id, user_answer } = req.body || {};

    if (!isValidId(id) || !isValidId(question_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session or question ID",
      });
    }

    if (
      typeof user_answer !== "string" ||
      !user_answer.trim() ||
      user_answer.trim().length > 10000
    ) {
      return res.status(400).json({
        success: false,
        message: "Answer is required and must not exceed 10,000 characters",
      });
    }

    const sessionResult = await pool.query(
      `SELECT *
       FROM interview_sessions
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (!sessionResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found",
      });
    }

    const session = sessionResult.rows[0];

    if (session.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed sessions cannot be edited",
      });
    }

    const questionResult = await pool.query(
      `SELECT id
       FROM interview_questions
       WHERE id = $1
         AND job_role = $2
         AND difficulty = $3
         AND is_active = TRUE
         AND ($4 = 'Mixed' OR interview_type = $4)`,
      [
        question_id,
        session.job_role,
        session.difficulty,
        session.interview_type,
      ]
    );

    if (!questionResult.rows.length) {
      return res.status(400).json({
        success: false,
        message: "This question does not belong to the selected session",
      });
    }

    // Transparent rule-based feedback; no AI scoring is claimed.
    const answer = user_answer.trim();

    let feedback;

    if (answer.length < 30) {
      feedback =
        "Your answer is quite short. Add more relevant details and explain your reasoning.";
    } else if (answer.length < 100) {
      feedback =
        "Good start. Try adding a practical example or explaining your approach in more detail.";
    } else {
      feedback =
        "Your answer includes useful detail. Review the suggested answer and check whether you covered the key points.";
    }

    const result = await pool.query(
      `INSERT INTO interview_answers (
         session_id,
         question_id,
         user_answer,
         feedback
       )
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (session_id, question_id)
       DO UPDATE SET
         user_answer = EXCLUDED.user_answer,
         feedback = EXCLUDED.feedback,
         updated_at = NOW()
       RETURNING *`,
      [id, question_id, answer, feedback]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*)::INTEGER AS completed_questions
       FROM interview_answers
       WHERE session_id = $1`,
      [id]
    );

    const completedQuestions =
      countResult.rows[0].completed_questions;

    await pool.query(
      `UPDATE interview_sessions
       SET completed_questions = $1
       WHERE id = $2 AND user_id = $3`,
      [completedQuestions, id, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Answer saved successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Save interview answer failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save interview answer",
    });
  }
};

// 6. Complete a practice session
const completeSession = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID",
      });
    }

    const result = await pool.query(
      `UPDATE interview_sessions
       SET status = 'completed',
           completed_at = NOW()
       WHERE id = $1
         AND user_id = $2
         AND status = 'in_progress'
       RETURNING *`,
      [id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Active interview session not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview session completed successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Complete interview session failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to complete interview session",
    });
  }
};

// 7. Get user progress
const getProgress = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         COUNT(*)::INTEGER AS total_sessions,
         COUNT(*) FILTER (
           WHERE status = 'completed'
         )::INTEGER AS completed_sessions,
         COUNT(*) FILTER (
           WHERE status = 'in_progress'
         )::INTEGER AS in_progress_sessions,
         COALESCE(SUM(completed_questions), 0)::INTEGER
           AS total_answers
       FROM interview_sessions
       WHERE user_id = $1`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Get interview progress failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve interview progress",
    });
  }
};

module.exports = {
  getQuestions,
  createSession,
  getSessions,
  getSessionById,
  saveAnswer,
  completeSession,
  getProgress,
};
