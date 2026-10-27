const pool = require("../config/db");

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         education_level,
         field_of_study,
         career_goal,
         experience_level,
         location,
         bio
       FROM user_profiles
       WHERE user_id = $1`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: result.rows[0] || null,
      message: result.rows.length
        ? "Profile retrieved successfully"
        : "Profile not created yet",
    });
  } catch (error) {
    console.error("Get profile failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve profile",
    });
  }
};


const saveProfile = async (req, res) => {
  try {
    const allowedFields = [
      "education_level",
      "field_of_study",
      "career_goal",
      "experience_level",
      "location",
      "bio",
    ];

    const experienceLevels = [
      "Student",
      "Entry Level",
      "Junior",
      "Mid Level",
      "Senior",
    ];

    const body = req.body;

    // 1. Validate the request body
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one profile field",
      });
    }

    // 2. Reject unknown fields
    const unknownFields = Object.keys(body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unknownFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Unknown profile field",
        fields: unknownFields,
      });
    }

    // 3. Validate field types and lengths
    const fieldLimits = {
      education_level: 100,
      field_of_study: 150,
      career_goal: 150,
      experience_level: 50,
      location: 150,
      bio: 2000,
    };

    for (const [field, value] of Object.entries(body)) {
      if (value !== null && typeof value !== "string") {
        return res.status(400).json({
          success: false,
          message: `${field} must be text or null`,
        });
      }

      if (
        typeof value === "string" &&
        value.length > fieldLimits[field]
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} exceeds the maximum length of ${fieldLimits[field]} characters`,
        });
      }

      if (typeof value === "string" && value.trim() === "") {
        return res.status(400).json({
          success: false,
          message: `${field} cannot be empty`,
        });
      }
    }

    // 4. Validate experience level
    if (
      body.experience_level !== undefined &&
      body.experience_level !== null &&
      !experienceLevels.includes(body.experience_level)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience level",
        allowedValues: experienceLevels,
      });
    }

    // 5. Get the existing profile
    const existingResult = await pool.query(
      "SELECT * FROM user_profiles WHERE user_id = $1",
      [req.user.id]
    );

    const existingProfile = existingResult.rows[0];

    // 6. Preserve fields that were not submitted
    const fields = [
      "education_level",
      "field_of_study",
      "career_goal",
      "experience_level",
      "location",
      "bio",
    ];

    const values = fields.map((field) => {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        return body[field];
      }

      return existingProfile ? existingProfile[field] : null;
    });

    // 7. Create or update the profile
    const result = await pool.query(
      `INSERT INTO user_profiles (
         user_id,
         education_level,
         field_of_study,
         career_goal,
         experience_level,
         location,
         bio
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id)
       DO UPDATE SET
         education_level = EXCLUDED.education_level,
         field_of_study = EXCLUDED.field_of_study,
         career_goal = EXCLUDED.career_goal,
         experience_level = EXCLUDED.experience_level,
         location = EXCLUDED.location,
         bio = EXCLUDED.bio,
         updated_at = CURRENT_TIMESTAMP
       RETURNING
         user_id,
         education_level,
         field_of_study,
         career_goal,
         experience_level,
         location,
         bio,
         updated_at`,
      [req.user.id, ...values]
    );

    return res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Save profile failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save profile",
    });
  }
};

module.exports = { getProfile, saveProfile };