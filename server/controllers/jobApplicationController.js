
const pool = require("../config/db");

const allowedStatuses = [
  "Saved",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

const createApplication = async (req, res) => {
  try {
    const {
      company_name,
      job_title,
      job_url,
      application_date,
      status,
      interview_date,
      notes,
    } = req.body || {};

    if (
      typeof company_name !== "string" ||
      !company_name.trim() ||
      company_name.trim().length > 150
    ) {
      return res.status(400).json({
        success: false,
        message: "Company name is required and must be at most 150 characters",
      });
    }

    if (
      typeof job_title !== "string" ||
      !job_title.trim() ||
      job_title.trim().length > 150
    ) {
      return res.status(400).json({
        success: false,
        message: "Job title is required and must be at most 150 characters",
      });
    }

    if (
      job_url !== undefined &&
      job_url !== null &&
      typeof job_url !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Job URL must be text",
      });
    }

    if (job_url && job_url.length > 2048) {
      return res.status(400).json({
        success: false,
        message: "Job URL is too long",
      });
    }

    if (
      notes !== undefined &&
      notes !== null &&
      typeof notes !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Notes must be text",
      });
    }

    if (notes && notes.length > 10000) {
      return res.status(400).json({
        success: false,
        message: "Notes cannot exceed 10,000 characters",
      });
    }

    if (
      status !== undefined &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
        allowedStatuses,
      });
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    for (const [field, value] of [
      ["application_date", application_date],
      ["interview_date", interview_date],
    ]) {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        (typeof value !== "string" || !datePattern.test(value))
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} must use YYYY-MM-DD format`,
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO job_applications (
         user_id,
         company_name,
         job_title,
         job_url,
         application_date,
         status,
         interview_date,
         notes
       )
       VALUES (
         $1, $2, $3, $4,
         COALESCE($5::date, CURRENT_DATE),
         COALESCE($6, 'Applied'),
         $7::date,
         $8
       )
       RETURNING *`,
      [
        req.user.id,
        company_name.trim(),
        job_title.trim(),
        job_url?.trim() || null,
        application_date || null,
        status || "Applied",
        interview_date || null,
        notes?.trim() || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Job application created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create application failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create job application",
    });
  }
};

const getApplications = async (req, res) => {
  try {
    const { status } = req.query;

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
        allowedStatuses,
      });
    }

    const values = [req.user.id];
    let query = `
      SELECT *
      FROM job_applications
      WHERE user_id = $1
    `;

    if (status) {
      values.push(status);
      query += ` AND status = $${values.length}`;
    }

    query += " ORDER BY created_at DESC, id DESC";

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get applications failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve job applications",
    });
  }
};

const updateApplication = async (req, res) => {
  try {
    const applicationId = req.params.id;

    if (!/^\d+$/.test(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const body = req.body;

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const allowedFields = [
      "company_name",
      "job_title",
      "job_url",
      "application_date",
      "status",
      "interview_date",
      "notes",
    ];

    const unknownFields = Object.keys(body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unknownFields.length) {
      return res.status(400).json({
        success: false,
        message: "Unknown field(s) provided",
        fields: unknownFields,
      });
    }

    const stringLimits = {
      company_name: 150,
      job_title: 150,
      job_url: 2048,
      notes: 10000,
    };

    for (const [field, value] of Object.entries(body)) {
      if (
        value !== null &&
        typeof value !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} must be text or null`,
        });
      }

      if (
        typeof value === "string" &&
        value.length > stringLimits[field] &&
        stringLimits[field] !== undefined
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} exceeds its maximum length`,
        });
      }

      if (
        ["company_name", "job_title"].includes(field) &&
        (value === null || !value.trim())
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} cannot be empty`,
        });
      }
    }

    if (
      body.status !== undefined &&
      !allowedStatuses.includes(body.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
        allowedStatuses,
      });
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    for (const field of ["application_date", "interview_date"]) {
      const value = body[field];

      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        (typeof value !== "string" || !datePattern.test(value))
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} must use YYYY-MM-DD format`,
        });
      }
    }

    const fields = Object.keys(body);
    const values = [applicationId, req.user.id];

    const assignments = fields.map((field) => {
      let value = body[field];

      if (typeof value === "string") {
        value = value.trim();
      }

      if (
        ["job_url", "interview_date", "application_date", "notes"].includes(field) &&
        value === ""
      ) {
        value = null;
      }

      values.push(value);

      if (["application_date", "interview_date"].includes(field)) {
        return `${field} = $${values.length}::date`;
      }

      return `${field} = $${values.length}`;
    });

    assignments.push("updated_at = CURRENT_TIMESTAMP");

    const result = await pool.query(
      `UPDATE job_applications
       SET ${assignments.join(", ")}
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      values
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Job application not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job application updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update application failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update job application",
    });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const applicationId = req.params.id;

    if (!/^\d+$/.test(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const result = await pool.query(
      `DELETE FROM job_applications
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [applicationId, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Job application not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job application deleted successfully",
    });
  } catch (error) {
    console.error("Delete application failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete job application",
    });
  }
};

module.exports = {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication,
};
