
const mammoth = require("mammoth");
const { PDFParse } = require("pdf-parse");

const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const createResumeError = (message) => {
  const error = new Error(message);
  error.code = "RESUME_PARSE_ERROR";
  return error;
};

// Extract text from PDF files
const extractPdfText = async (buffer) => {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();

    if (typeof result.text !== "string") {
      throw createResumeError("Unable to read the PDF resume.");
    }

    return result.text.trim();
  } catch (error) {
    if (error.code === "RESUME_PARSE_ERROR") {
      throw error;
    }

    throw createResumeError(
      "The PDF file is invalid, damaged, or could not be read."
    );
  } finally {
    await parser.destroy();
  }
};

// Extract text from DOCX files
const extractDocxText = async (buffer) => {
  try {
    // Mammoth opens and parses the DOCX document structure
    const result = await mammoth.extractRawText({ buffer });

    if (typeof result.value !== "string") {
      throw createResumeError("Unable to read the DOCX resume.");
    }

    return result.value.trim();
  } catch (error) {
    if (error.code === "RESUME_PARSE_ERROR") {
      throw error;
    }

    throw createResumeError(
      "The DOCX file is invalid, damaged, or has an unsupported document structure."
    );
  }
};

// Main resume text extraction function
const extractResumeText = async (file) => {
  if (
    !file ||
    !Buffer.isBuffer(file.buffer) ||
    file.buffer.length === 0 ||
    !file.mimetype
  ) {
    throw createResumeError("Invalid or empty resume file.");
  }

  // Enforce the existing 5 MB upload limit
  if (file.buffer.length > 5 * 1024 * 1024) {
    throw createResumeError("Resume file cannot exceed 5 MB.");
  }

  let extractedText = "";

  if (file.mimetype === "application/pdf") {
    extractedText = await extractPdfText(file.buffer);
  } else if (file.mimetype === DOCX_MIME_TYPE) {
    extractedText = await extractDocxText(file.buffer);
  } else {
    throw createResumeError(
      "Only PDF and DOCX resume files are supported."
    );
  }

  if (!extractedText) {
    throw createResumeError(
      "No readable text found. Please upload a text-based PDF or DOCX file."
    );
  }

  return extractedText;
};

module.exports = {
  extractResumeText,
};
