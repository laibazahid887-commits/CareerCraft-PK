
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  upload,
  validateResumeFile,
} = require("../middleware/uploadMiddleware");

const {
  analyzeResume,
} = require("../controllers/resumeController");

// Resume analysis requires authentication and file validation
router.post(
  "/analyze",
  protect,
  upload.single("resume"),
  validateResumeFile,
  analyzeResume
);

module.exports = router;
