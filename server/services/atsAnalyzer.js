
const skillLibrary = [
  "javascript",
  "typescript",
  "react",
  "angular",
  "vue",
  "node.js",
  "express.js",
  "html",
  "css",
  "bootstrap",
  "tailwind css",
  "python",
  "java",
  "c++",
  "c#",
  "php",
  "flask",
  "django",
  "sql",
  "postgresql",
  "mysql",
  "mongodb",
  "sqlite",
  "firebase",
  "rest api",
  "graphql",
  "git",
  "github",
  "docker",
  "kubernetes",
  "aws",
  "azure",
  "google cloud",
  "figma",
  "ui/ux",
  "ui design",
  "ux design",
  "wordpress",
  "seo",
  "digital marketing",
  "content writing",
  "project management",
  "agile",
  "scrum",
  "machine learning",
  "data analysis",
  "data visualization",
  "excel",
  "power bi",
  "tableau",
  "communication",
  "teamwork",
  "leadership",
  "problem solving",
  "critical thinking",
  "time management",
];

const skillAliases = {
  javascript: ["js", "ecmascript"],
  typescript: ["ts"],
  react: ["reactjs"],
  angular: ["angularjs"],
  "node.js": ["nodejs"],
  "express.js": ["express"],
  postgresql: ["postgres"],
  mongodb: ["mongo"],
  "rest api": ["rest apis", "restful api", "restful apis"],
  "tailwind css": ["tailwind"],
  "google cloud": ["gcp", "google cloud platform"],
  kubernetes: ["k8s"],
  "machine learning": ["ml"],
  "power bi": ["powerbi"],
  "ui/ux": ["ui ux", "ui and ux"],
};

const sectionPatterns = {
  contact: /\b(email|phone|contact|linkedin|github|address)\b/i,

  summary:
    /\b(summary|professional summary|profile|career objective|personal statement)\b/i,

  education:
    /\b(education|academic background|academic qualifications|educational qualifications|qualifications)\b/i,

  experience:
    /\b(experience|work experience|professional experience|employment history|work history|internship|internships)\b/i,

  skills:
    /\b(skills|technical skills|core competencies|key skills|technical expertise|professional skills)\b/i,

  projects:
    /\b(projects|personal projects|academic projects|professional projects|selected projects|key projects)\b/i,
};

// Common action verbs used in professional resumes
const actionVerbs = [
  "developed",
  "designed",
  "built",
  "created",
  "implemented",
  "managed",
  "led",
  "improved",
  "optimized",
  "automated",
  "integrated",
  "launched",
  "delivered",
  "increased",
  "reduced",
  "resolved",
  "analyzed",
  "tested",
  "deployed",
  "coordinated",
  "organized",
  "engineered",
  "maintained",
  "documented",
  "achieved",
];

// Patterns for measurable results
const achievementPatterns = [
  /\b\d+(?:\.\d+)?\s*%/i,

  /\b\d+(?:,\d{3})*(?:\.\d+)?\s*(users|clients|customers|projects|employees|members|hours|days|weeks|months|years|tasks|applications|websites|pages|records)\b/i,

  /[$€£]\s*\d+(?:,\d{3})*(?:\.\d+)?/i,

  /\b(increased|reduced|improved|saved|generated|grew)\b.{0,60}\b\d+(?:\.\d+)?/i,
];

const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const containsTerm = (text, term) => {
  const termsToCheck = [
    term,
    ...(skillAliases[term] || []),
  ];

  return termsToCheck.some((item) => {
    const escapedTerm = item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const pattern = new RegExp(
      `(^|[^a-z0-9])${escapedTerm}(?=$|[^a-z0-9])`,
      "i"
    );

    return pattern.test(text);
  });
};

// Validate whether extracted document text resembles a resume
const validateResumeContent = (resumeText) => {
  if (typeof resumeText !== "string" || !resumeText.trim()) {
    throw new Error("Please upload a valid resume.");
  }

  const text = resumeText.toLowerCase();

  // Check for contact information
  const hasEmail =
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text);

  const hasPhone =
    /(?:\+?\d[\d\s().-]{7,}\d)/.test(text);

  const hasContactInformation = hasEmail || hasPhone;

  // Check for important resume sections
  const resumeSectionPatterns = [
    /\b(education|academic background|qualification)\b/i,
    /\b(experience|employment|work history|internship)\b/i,
    /\b(skills|technical skills|core competencies)\b/i,
    /\b(projects|personal projects|academic projects)\b/i,
    /\b(summary|professional summary|career objective|profile)\b/i,
  ];

  const detectedResumeSections = resumeSectionPatterns.filter(
    (pattern) => pattern.test(text)
  ).length;

  // Require contact information and at least two resume sections
  if (!hasContactInformation || detectedResumeSections < 2) {
    throw new Error(
      "This document does not appear to be a resume. Please upload your resume with contact information and relevant sections such as education, experience, skills, or projects."
    );
  }

  return true;
};

// Detect obvious source code in a job description
const containsSourceCode = (text) => {
  const codePatterns = [
    /\b(const|let|var|function|class|import|export)\b/,
    /=>/,
    /\b(console\.log|console\.error|return)\b/,
    /<\/?[a-z][^>]*>/i,
    /\b(def|elif|print)\s*\(/,
    /\{\s*[\w$]+\s*:/,
    /\b(public|private|static)\s+(void|int|string|class)\b/,
  ];

  const matches = codePatterns.filter((pattern) =>
    pattern.test(text)
  ).length;

  return matches >= 2;
};

// Validate whether the supplied text resembles a job description
const validateJobDescription = (jobDescription) => {
  if (
    typeof jobDescription !== "string" ||
    !jobDescription.trim()
  ) {
    throw new Error("Please enter a valid job description.");
  }

  const text = jobDescription.toLowerCase();

  if (containsSourceCode(text)) {
    throw new Error(
      "Please enter a valid job description, not source code."
    );
  }

  const jobDescriptionPatterns = [
    /\b(job title|job description|position|role|vacancy|opening)\b/i,
    /\b(responsibilities|duties|what you will do)\b/i,
    /\b(requirements|required skills|qualifications|eligibility)\b/i,
    /\b(candidate|applicant|we are looking|we seek|we are hiring)\b/i,
    /\b(years of experience|work experience|experience required)\b/i,
    /\b(bachelor|master|degree|diploma)\b/i,
    /\b(apply now|how to apply|application process)\b/i,
    /\b(technical skills|communication skills|teamwork)\b/i,
  ];

  const detectedJobIndicators = jobDescriptionPatterns.filter(
    (pattern) => pattern.test(text)
  ).length;

  if (detectedJobIndicators < 2) {
    throw new Error(
      "This text does not appear to be a job description. Please provide the job role, responsibilities, qualifications, or required skills."
    );
  }

  return true;
};

// Analyze action verbs and measurable achievements
const analyzeAchievements = (resumeText) => {
  const text = resumeText.toLowerCase();

  // Find action verbs used in the resume
  const actionVerbsFound = actionVerbs.filter((verb) => {
    const escapedVerb = verb.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\b${escapedVerb}\\b`, "i");

    return pattern.test(text);
  });

  // Split extracted resume text into individual lines
  const resumeLines = resumeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  // Find lines containing both an action verb and a measurable result
  const achievementExamples = resumeLines.filter((line) => {
    const lineText = line.toLowerCase();

    const hasActionVerb = actionVerbs.some((verb) => {
      const escapedVerb = verb.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\b${escapedVerb}\\b`, "i").test(lineText);
    });

    const hasMeasurableResult = achievementPatterns.some((pattern) =>
      pattern.test(lineText)
    );

    return hasActionVerb && hasMeasurableResult;
  });

  const quantifiedAchievementsCount = achievementExamples.length;

  const feedback = [];

  if (actionVerbsFound.length === 0) {
    feedback.push(
      "Use clear action verbs such as developed, designed, implemented, and improved to describe your work."
    );
  } else {
    feedback.push(
      `Your resume uses ${actionVerbsFound.length} different action verbs to describe your work.`
    );
  }

  if (quantifiedAchievementsCount === 0) {
    feedback.push(
      "Add measurable results where possible, such as project counts, percentage improvements, users reached, or time saved."
    );
  } else {
    feedback.push(
      `Your resume contains ${quantifiedAchievementsCount} achievement statement(s) with measurable details.`
    );
  }

  return {
    actionVerbsFound,
    actionVerbCount: actionVerbsFound.length,
    quantifiedAchievementsCount,
    hasQuantifiedAchievements: quantifiedAchievementsCount > 0,
    achievementExamples: achievementExamples.slice(0, 5),
    feedback,
  };
};

const analyzeResume = (resumeText, jobDescription) => {
  if (
    typeof resumeText !== "string" ||
    !resumeText.trim() ||
    typeof jobDescription !== "string" ||
    !jobDescription.trim()
  ) {
    throw new Error("Resume text and job description are required.");
  }

  // Validate both inputs before performing ATS analysis
  validateResumeContent(resumeText);
  validateJobDescription(jobDescription);

  const normalizedResume = normalizeText(resumeText);
  const normalizedJob = normalizeText(jobDescription);

  // Find skills mentioned in the job description
  const requiredSkills = skillLibrary.filter((skill) =>
    containsTerm(normalizedJob, skill)
  );

  // Find matching skills in the resume
  const matchedSkills = requiredSkills.filter((skill) =>
    containsTerm(normalizedResume, skill)
  );

  const missingSkills = requiredSkills.filter(
    (skill) => !matchedSkills.includes(skill)
  );

  const keywordScore =
    requiredSkills.length > 0
      ? (matchedSkills.length / requiredSkills.length) * 100
      : 0;

  // Check standard resume sections
  const detectedSections = Object.entries(sectionPatterns)
    .filter(([, pattern]) => pattern.test(normalizedResume))
    .map(([section]) => section);

  const missingSections = Object.keys(sectionPatterns).filter(
    (section) => !detectedSections.includes(section)
  );

  const structureScore =
    (detectedSections.length / Object.keys(sectionPatterns).length) * 100;

  // Basic readability checks
  const wordCount = normalizedResume
    .split(/\s+/)
    .filter(Boolean).length;

  const readabilityScore = Math.min(
    100,
    Math.round((wordCount / 300) * 100)
  );

  // Analyze resume achievements
  const achievementAnalysis = analyzeAchievements(resumeText);

  // Calculate overall CareerCraft score
  // Existing scoring weights remain unchanged
  const overallScore = Math.round(
    keywordScore * 0.7 +
    structureScore * 0.2 +
    readabilityScore * 0.1
  );

  // Generate feedback
  const strengths = [];

  if (matchedSkills.length > 0) {
    strengths.push(
      `Your resume contains ${matchedSkills.length} skills relevant to this job.`
    );
  }

  if (detectedSections.includes("experience")) {
    strengths.push("Your resume includes an experience section.");
  }

  if (detectedSections.includes("education")) {
    strengths.push("Your resume includes an education section.");
  }

  if (achievementAnalysis.actionVerbCount > 0) {
    strengths.push(
      "Your resume uses action verbs to describe your work and responsibilities."
    );
  }

  if (achievementAnalysis.hasQuantifiedAchievements) {
    strengths.push(
      "Your resume includes work statements with measurable results."
    );
  }

  const suggestions = [];

  if (missingSkills.length > 0) {
    suggestions.push(
      "Review the missing job-related skills and include them only if you genuinely have those skills."
    );
  }

  if (missingSections.length > 0) {
    suggestions.push(
      `Consider adding or clearly labeling these sections: ${missingSections.join(", ")}.`
    );
  }

  if (wordCount < 150) {
    suggestions.push(
      "Your resume contains limited text. Consider adding relevant experience, projects, skills, and education details."
    );
  }

  if (requiredSkills.length === 0) {
    suggestions.push(
      "No supported skills were detected in the job description. Review the job description or expand the skill library."
    );
  }

  // Add achievement-related suggestions
  if (achievementAnalysis.actionVerbCount === 0) {
    suggestions.push(
      "Use strong action verbs to explain your contributions in projects and experience."
    );
  }

  if (!achievementAnalysis.hasQuantifiedAchievements) {
    suggestions.push(
      "Where accurate, add measurable results to your experience and project descriptions. Do not invent numbers or achievements."
    );
  }

  return {
    overallScore,
    keywordScore: Math.round(keywordScore),
    structureScore: Math.round(structureScore),
    readabilityScore,

    totalJobSkills: requiredSkills.length,
    matchedSkills,
    missingSkills,

    detectedSections,
    missingSections,

    wordCount,

    achievementAnalysis,

    strengths,
    suggestions,

    scoringMethod: "CareerCraft PK Rule-Based ATS v1",
  };
};

module.exports = {
  analyzeResume,
  validateResumeContent,
  validateJobDescription,
};
