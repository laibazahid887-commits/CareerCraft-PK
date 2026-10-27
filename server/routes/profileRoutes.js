const express = require("express");
const router = express.Router();

const { getProfile, saveProfile } = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

// GET: Retrieve the logged-in user's profile
router.get("/", protect, getProfile);

// PUT: Create or update the logged-in user's profile
router.put("/", protect, saveProfile);

module.exports = router;