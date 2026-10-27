const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const pool = require("../config/db");
const { registerUser, loginUser, getCurrentUser } = require("../controllers/userController");
// GET: Retrieve users
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, created_at
       FROM users
       ORDER BY id ASC`
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Failed to fetch users:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch users",
    });
  }
});

// POST: Register a new user
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);
module.exports = router;