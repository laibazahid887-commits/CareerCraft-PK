require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 4000;
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const jobApplicationRoutes = require("./routes/jobApplicationRoutes");

// Allow requests from the React frontend
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/job-applications", jobApplicationRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to CareerCraft PK Backend!");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CareerCraft PK backend is healthy",
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    res.json({
      success: true,
      message: "PostgreSQL connected successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Database test failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`CareerCraft PK server is running on port ${PORT}`);
});
