const bcrypt = require("bcrypt");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const registerUser = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email, created_at`,
      [full_name.trim(), normalizedEmail, passwordHash]
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Registration failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to register user",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `SELECT id, full_name, email, password_hash
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }


const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
  },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

return res.status(200).json({
  success: true,
  message: "Login successful",
  token,
  data: {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
  },
});
  } catch (error) {
    console.error("Login failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to log in",
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to fetch current user:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch user profile",
    });
  }
};

module.exports = { registerUser, loginUser, getCurrentUser };
