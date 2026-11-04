
const { extractResumeText } = require("../services/resumeparser");

const {
  analyzeResume,
  validateResumeContent,
  validateJobDescription,
} = require("../services/atsAnalyzer");

const analyzeResumeController = async (req, res) => {
  try {
    // Check uploaded resume
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload your resume.",
      });
    }

    // Get job description
    const { jobDescription } = req.body || {};

    if (
      typeof jobDescription !== "string" ||
      !jobDescription.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Job description is required.",
      });
    }

    const trimmedJobDescription = jobDescription.trim();

    if (trimmedJobDescription.length < 50) {
      return res.status(400).json({
        success: false,
        message: "Job description must contain at least 50 characters.",
      });
    }

    if (trimmedJobDescription.length > 15000) {
      return res.status(400).json({
        success: false,
        message: "Job description cannot exceed 15,000 characters.",
      });
    }

    // Validate job description before processing the resume
    validateJobDescription(trimmedJobDescription);

    // Extract resume text
    const resumeText = await extractResumeText(req.file);

    // Validate whether the document resembles a resume
    validateResumeContent(resumeText);

    // Compare resume with job description
    const analysis = analyzeResume(
      resumeText,
      trimmedJobDescription
    );

    return res.status(200).json({
      success: true,
      message: "Resume analyzed successfully.",
      data: {
        fileName: req.file.originalname,
        analysis,
      },
    });
  } catch (error) {
    console.error("Resume analysis failed:", error.message);

    // Known input and document validation errors
    const isClientError =
      error.code === "RESUME_PARSE_ERROR" ||
      error.message.includes("does not appear") ||
      error.message.startsWith("Please enter a valid job description") ||
      error.message.startsWith("Only PDF and DOCX") ||
      error.message.startsWith("Resume text and job description");

    if (isClientError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Unexpected server errors
    return res.status(500).json({
      success: false,
      message: "Unable to analyze the uploaded resume. Please try again.",
    });
  }
};

module.exports = {
  analyzeResume: analyzeResumeController,
};
