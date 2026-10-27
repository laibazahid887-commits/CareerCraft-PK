
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication,
} = require("../controllers/jobApplicationController");

// All routes require authentication
router.use(protect);

// GET: Retrieve the logged-in user's applications
router.get("/", getApplications);

// POST: Create a new job application
router.post("/", createApplication);

// PUT: Update an existing application
router.put("/:id", updateApplication);

// DELETE: Delete an existing application
router.delete("/:id", deleteApplication);

module.exports = router;
