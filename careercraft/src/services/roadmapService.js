const roadmapResources = {
  HTML: "https://developer.mozilla.org/en-US/docs/Learn/HTML",
  CSS: "https://developer.mozilla.org/en-US/docs/Learn/CSS",
  JavaScript: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
  React: "https://react.dev/learn",
  Bootstrap: "https://getbootstrap.com/docs/",
  "Node.js": "https://nodejs.org/en/learn",
  "Express.js": "https://expressjs.com/",
  "REST APIs": "https://developer.mozilla.org/en-US/docs/Web/HTTP",
  PostgreSQL: "https://www.postgresql.org/docs/",
  MySQL: "https://dev.mysql.com/doc/",
  MongoDB: "https://www.mongodb.com/docs/",
  Git: "https://git-scm.com/doc",
  GitHub: "https://docs.github.com/",
  Python: "https://docs.python.org/3/tutorial/",
  Java: "https://dev.java/learn/",
  SQL: "https://www.postgresql.org/docs/current/tutorial.html",
  Figma: "https://help.figma.com/",
  "UI/UX Design": "https://www.nngroup.com/articles/",
  SEO: "https://developers.google.com/search/docs",
  "Google Ads": "https://skillshop.withgoogle.com/",
  "Meta Ads": "https://www.facebook.com/business/learn",
  Communication: "https://www.coursera.org/",
  "Problem Solving": "https://www.freecodecamp.org/",
  Teamwork: "https://www.coursera.org/",
};

const roadmapProjects = {
  HTML: "Build an accessible personal profile page.",
  CSS: "Create a responsive landing page.",
  JavaScript: "Build an interactive task list.",
  React: "Build a reusable React component dashboard.",
  Bootstrap: "Create a responsive page using Bootstrap.",
  "Node.js": "Build a small Node.js command-line application.",
  "Express.js": "Create an Express REST API.",
  "REST APIs": "Build and test CRUD endpoints.",
  PostgreSQL: "Design a relational database for a small application.",
  MySQL: "Create tables and write SQL queries.",
  MongoDB: "Build a small document-based data model.",
  Git: "Practice branching, commits, and merging.",
  GitHub: "Publish a project with a clear README.",
  Python: "Create a small Python automation script.",
  Java: "Build a simple Java console application.",
  SQL: "Write queries using filtering, joins, and grouping.",
  Figma: "Design a multi-screen application prototype.",
  "UI/UX Design": "Create a user flow and test a clickable prototype.",
  SEO: "Improve the metadata and structure of a demo website.",
  "Google Ads": "Create a sample campaign plan without launching ads.",
  "Meta Ads": "Prepare a sample audience and ad creative plan.",
  Communication: "Write and present a short project explanation.",
  "Problem Solving": "Solve and document a set of coding challenges.",
  Teamwork: "Write a team project plan with clear responsibilities.",
};

export function generateRoadmap(missingSkills = []) {
  if (!Array.isArray(missingSkills)) {
    return [];
  }

  return missingSkills.map((skill, index) => {
    const name = typeof skill === "string" ? skill : skill.name;

    return {
      id: `${name}-${index}`,
      name,
      category: skill.category || "General",
      priority: skill.priority || "High",
      action: `Learn the fundamentals of ${name} and practise with a small exercise.`,
      project:
        roadmapProjects[name] ||
        `Build a small practical project using ${name}.`,
      resource:
        roadmapResources[name] ||
        "https://www.freecodecamp.org/",
      completed: false,
    };
  });
}