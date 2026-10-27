
const skillLibrary = [
  // Frontend
  { name: "HTML", keywords: ["html", "html5"], category: "Frontend" },
  { name: "CSS", keywords: ["css", "css3", "cascading style sheets"], category: "Frontend" },
  { name: "JavaScript", keywords: ["javascript", "js", "ecmascript"], category: "Frontend" },
  { name: "React", keywords: ["react", "react.js", "reactjs"], category: "Frontend" },
  { name: "Bootstrap", keywords: ["bootstrap"], category: "Frontend" },
  { name: "Responsive Design", keywords: ["responsive design", "mobile responsive", "responsive websites"], category: "Frontend" },
  { name: "Wireframing", keywords: ["wireframing", "wireframes", "wireframe"], category: "Design" },
  { name: "Prototyping", keywords: ["prototyping", "prototypes", "prototype"], category: "Design" },

  // Backend and databases
  { name: "Node.js", keywords: ["node.js", "nodejs", "node js"], category: "Backend" },
  { name: "Express", keywords: ["express.js", "expressjs", "express js", "express"], category: "Backend" },
  { name: "REST APIs", keywords: ["rest apis", "rest api", "restful apis", "restful api"], category: "Backend" },
  { name: "PostgreSQL", keywords: ["postgresql", "postgres"], category: "Database" },
  { name: "MySQL", keywords: ["mysql"], category: "Database" },
  { name: "MongoDB", keywords: ["mongodb", "mongo db"], category: "Database" },
  { name: "SQL", keywords: ["sql"], category: "Database" },
  { name: "Python", keywords: ["python"], category: "Programming" },
  { name: "Java", keywords: ["java"], category: "Programming" },

  // Tools
  { name: "Git", keywords: ["git", "version control"], category: "Tools" },
  { name: "GitHub", keywords: ["github"], category: "Tools" },

  // UI/UX and graphic design
  { name: "Figma", keywords: ["figma"], category: "Design" },
  { name: "UI/UX Design", keywords: ["ui/ux design", "ui/ux", "ui ux", "user interface design", "user experience design"], category: "Design" },
  { name: "Typography", keywords: ["typography"], category: "Design" },
  { name: "User Research", keywords: ["user research", "user interviews", "usability research"], category: "Design" },
  { name: "Color Theory", keywords: ["color theory", "colour theory"], category: "Design" },
  { name: "Layout Design", keywords: ["layout design", "visual layouts"], category: "Design" },
  { name: "Branding", keywords: ["branding", "brand identity", "brand identities"], category: "Design" },
  { name: "Visual Communication", keywords: ["visual communication"], category: "Design" },
  { name: "Adobe Photoshop", keywords: ["adobe photoshop", "photoshop"], category: "Design" },
  { name: "Adobe Illustrator", keywords: ["adobe illustrator", "illustrator"], category: "Design" },
  { name: "Canva", keywords: ["canva"], category: "Design" },

  // Digital marketing
  { name: "SEO", keywords: ["seo", "search engine optimization"], category: "Marketing" },
  { name: "Content Marketing", keywords: ["content marketing", "content strategy", "content creation", "content planning"], category: "Marketing" },
  { name: "Social Media Marketing", keywords: ["social media marketing", "social media management", "social media campaigns", "social media strategy"], category: "Marketing" },
  { name: "Analytics", keywords: ["google analytics", "web analytics", "digital analytics", "data analytics", "ga4", "analytics"], category: "Marketing" },
  { name: "Campaign Planning", keywords: ["campaign planning", "marketing campaigns", "campaign management", "campaign strategy"], category: "Marketing" },
  { name: "Google Ads", keywords: ["google ads", "google adwords"], category: "Marketing" },
  { name: "Meta Ads", keywords: ["meta ads", "facebook ads", "instagram ads"], category: "Marketing" },
  { name: "Keyword Research", keywords: ["keyword research", "keyword analysis"], category: "Marketing" },
  { name: "Email Marketing", keywords: ["email marketing", "email campaigns"], category: "Marketing" },
  { name: "PPC", keywords: ["ppc", "pay per click", "pay-per-click"], category: "Marketing" },
  { name: "Copywriting", keywords: ["copywriting", "marketing copy"], category: "Marketing" },
  { name: "Google Search Console", keywords: ["google search console", "search console"], category: "Marketing" },

  // Business analysis
  { name: "Analytical Thinking", keywords: ["analytical thinking", "analytical skills", "critical thinking"], category: "Business" },
  { name: "Communication", keywords: ["communication skills", "verbal communication", "written communication", "communication"], category: "Soft Skills" },
  { name: "Excel", keywords: ["microsoft excel", "excel spreadsheets", "excel"], category: "Business" },
  { name: "Requirements Gathering", keywords: ["requirements gathering", "gathering requirements", "business requirements", "requirements analysis"], category: "Business" },
  { name: "Data Interpretation", keywords: ["data interpretation", "interpret data", "data analysis"], category: "Business" },
  { name: "Power BI", keywords: ["power bi"], category: "Business" },
  { name: "Jira", keywords: ["jira"], category: "Business" },
  { name: "Documentation", keywords: ["documentation", "technical documentation", "requirements documentation"], category: "Business" },

  // Education and training
  { name: "Lesson Planning", keywords: ["lesson planning", "lesson plans", "lesson plan"], category: "Education" },
  { name: "Classroom Management", keywords: ["classroom management"], category: "Education" },
  { name: "Subject Knowledge", keywords: ["subject knowledge", "subject expertise", "subject matter expertise"], category: "Education" },
  { name: "Assessment", keywords: ["assessment", "student assessment", "learner assessment"], category: "Education" },
  { name: "Teaching Methods", keywords: ["teaching methods", "teaching strategies", "pedagogy"], category: "Education" },
  { name: "Student Engagement", keywords: ["student engagement", "learner engagement"], category: "Education" },
  { name: "Learning Materials", keywords: ["learning materials", "teaching materials", "educational materials"], category: "Education" },
  { name: "Technical Knowledge", keywords: ["technical knowledge", "technical expertise", "technical skills"], category: "Training" },
  { name: "Presentation", keywords: ["presentation skills", "presentations", "presentation"], category: "Training" },
  { name: "Instructional Design", keywords: ["instructional design", "learning design", "training material design"], category: "Training" },

  // General skills
  { name: "Problem Solving", keywords: ["problem solving", "problem-solving"], category: "Soft Skills" },
  { name: "Teamwork", keywords: ["teamwork", "team work", "collaboration"], category: "Soft Skills" },
];

function containsKeyword(text, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`,
    "i"
  );

  return pattern.test(text);
}

function getClassification(description, keywords) {
  const classifications = [];

  for (const keyword of keywords) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(
      `(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`,
      "gi"
    );

    for (const match of description.matchAll(pattern)) {
      const position = match.index + match[1].length;
      const before = description.slice(0, position);
      const after = description.slice(position + keyword.length);

      const previousBoundary = Math.max(
        before.lastIndexOf("."),
        before.lastIndexOf("!"),
        before.lastIndexOf("?"),
        before.lastIndexOf("\n"),
        before.lastIndexOf(";")
      );

      const nextBoundaries = [
        after.indexOf("."),
        after.indexOf("!"),
        after.indexOf("?"),
        after.indexOf("\n"),
        after.indexOf(";"),
      ].filter((index) => index !== -1);

      const nextBoundary = nextBoundaries.length
        ? Math.min(...nextBoundaries)
        : after.length;

      const sentence = (
        before.slice(previousBoundary + 1) +
        description.slice(position, position + keyword.length) +
        after.slice(0, nextBoundary)
      ).toLowerCase();

      if (
        /\b(not required|not necessary|not essential|optional|no need for|need not have)\b/.test(sentence)
      ) {
        classifications.push("Not required");
      } else if (
        /\b(preferred|preferably|nice to have|a plus|bonus|desirable|advantageous)\b/.test(sentence)
      ) {
        classifications.push("Preferred");
      } else if (
        /\b(required|must have|essential|mandatory|proficient in|proficiency in)\b/.test(sentence)
      ) {
        classifications.push("Required");
      } else {
        classifications.push("Unspecified");
      }
    }
  }

  if (classifications.includes("Required")) return "Required";
  if (classifications.includes("Preferred")) return "Preferred";
  if (classifications.includes("Unspecified")) return "Unspecified";
  if (classifications.includes("Not required")) return "Not required";

  return "Unspecified";
}

export function analyzeJobDescription(description) {
  const normalizedDescription = description.toLowerCase();

  const detectedSkills = skillLibrary
    .filter((skill) =>
      skill.keywords.some((keyword) =>
        containsKeyword(normalizedDescription, keyword.toLowerCase())
      )
    )
    .map((skill) => ({
      ...skill,
      priority: "High",
      classification: getClassification(
        normalizedDescription,
        skill.keywords.map((keyword) => keyword.toLowerCase())
      ),
    }));

  const requiredSkills = detectedSkills.filter(
    (skill) => skill.classification === "Required"
  );

  const preferredSkills = detectedSkills.filter(
    (skill) => skill.classification === "Preferred"
  );

  const unspecifiedSkills = detectedSkills.filter(
    (skill) => skill.classification === "Unspecified"
  );

  const notRequiredSkills = detectedSkills.filter(
    (skill) => skill.classification === "Not required"
  );

  const categories = [
    ...new Set(detectedSkills.map((skill) => skill.category)),
  ];

  return {
    totalSkills: detectedSkills.length,
    detectedSkills,
    requiredSkills,
    preferredSkills,
    unspecifiedSkills,
    notRequiredSkills,
    categories,
    analyzedAt: new Date().toISOString(),
  };
}
