
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getQuestions,
  createSession,
  getSessions,
  getSessionById,
  saveAnswer,
  completeSession,
  getProgress,
} = require("../controllers/interviewController");

// All interview routes require authentication
router.use(protect);

// Questions
router.get("/questions", getQuestions);

// Practice sessions
router.post("/sessions", createSession);
router.get("/sessions", getSessions);
router.get("/sessions/:id", getSessionById);
router.post("/sessions/:id/answers", saveAnswer);
router.patch("/sessions/:id/complete", completeSession);

// User progress
router.get("/progress", getProgress);

module.exports = router;
