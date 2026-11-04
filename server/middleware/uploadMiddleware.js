
const multer = require("multer");
const path = require("path");

// Store uploaded files temporarily in memory
const storage = multer.memoryStorage();

// Allow only PDF and DOCX files based on the uploaded MIME type
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX resume files are allowed."));
  }
};

// Configure Multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum
    files: 1,
  },
});

// Validate the actual uploaded file content
const validateResumeFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload your resume.",
      });
    }

    // file-type is an ES module, so use dynamic import in CommonJS
    const { fileTypeFromBuffer } = await import("file-type");

    const detectedType = await fileTypeFromBuffer(req.file.buffer);

    if (!detectedType) {
      return res.status(400).json({
        success: false,
        message: "The uploaded file type could not be verified.",
      });
    }

    const extension = path
      .extname(req.file.originalname)
      .toLowerCase();

    const isPdf =
      extension === ".pdf" &&
      req.file.mimetype === "application/pdf" &&
      detectedType.ext === "pdf";

    const isDocx =
      extension === ".docx" &&
      req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
      detectedType.ext === "docx";

    if (!isPdf && !isDocx) {
      return res.status(400).json({
        success: false,
        message:
          "The file content does not match a supported PDF or DOCX resume.",
      });
    }

    next();
  } catch (error) {
    console.error("Resume file validation failed:", error.message);

    return res.status(400).json({
      success: false,
      message: "Unable to verify the uploaded resume file.",
    });
  }
};

module.exports = {
  upload,
  validateResumeFile,
};
