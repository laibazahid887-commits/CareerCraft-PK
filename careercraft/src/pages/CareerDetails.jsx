
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./CareerDetails.css";

const careers = [
  {
    id: 1,
    title: "Frontend Developer",
    category: "Technology",
    description:
      "Build responsive websites and interactive user interfaces that people can use easily.",
    responsibilities: [
      "Build website layouts using HTML and CSS.",
      "Add interactivity with JavaScript.",
      "Develop reusable interfaces with React.",
      "Test websites on different screen sizes.",
    ],
    skills: ["HTML", "CSS", "JavaScript", "React", "Git and GitHub"],
    tools: ["VS Code", "React", "Chrome DevTools", "GitHub"],
    roadmap: [
      "Learn HTML fundamentals",
      "Practice CSS and responsive design",
      "Understand JavaScript",
      "Build projects with React",
      "Publish projects on GitHub and Vercel",
    ],
    skillGapKey: "frontend",
  },
  {
    id: 2,
    title: "Backend Developer",
    category: "Technology",
    description:
      "Build the server-side logic, APIs, and databases that power web applications.",
    responsibilities: [
      "Create APIs for frontend applications.",
      "Process and validate user requests.",
      "Store and retrieve information from databases.",
      "Implement authentication and security.",
    ],
    skills: ["JavaScript", "Node.js", "Express", "PostgreSQL", "REST APIs"],
    tools: ["VS Code", "Postman", "Node.js", "PostgreSQL"],
    roadmap: [
      "Learn JavaScript fundamentals",
      "Understand Node.js",
      "Build APIs with Express",
      "Learn SQL and PostgreSQL",
      "Practice authentication and API security",
    ],
    skillGapKey: "backend",
  },
  {
    id: 3,
    title: "UI/UX Designer",
    category: "Design",
    description:
      "Create useful, accessible, and attractive digital experiences through research and design.",
    responsibilities: [
      "Understand user needs and problems.",
      "Create wireframes and user flows.",
      "Design interfaces and prototypes.",
      "Test designs and improve usability.",
    ],
    skills: [
      "Figma",
      "Wireframing",
      "Prototyping",
      "Typography",
      "User Research",
    ],
    tools: ["Figma", "FigJam", "Canva"],
    roadmap: [
      "Learn UI/UX design principles",
      "Practice user research and user flows",
      "Create wireframes in Figma",
      "Design high-fidelity interfaces",
      "Build a portfolio with case studies",
    ],
    skillGapKey: "uiux",
  },
  {
    id: 4,
    title: "Graphic Designer",
    category: "Design",
    description:
      "Create visual content for brands, marketing campaigns, and digital media.",
    responsibilities: [
      "Design graphics for digital and print materials.",
      "Create layouts using typography and color.",
      "Develop consistent visual identities for brands.",
      "Revise designs based on project requirements and feedback.",
    ],
    skills: [
      "Typography",
      "Color Theory",
      "Layout Design",
      "Branding",
      "Visual Communication",
    ],
    tools: ["Canva", "Adobe Photoshop", "Adobe Illustrator", "Figma"],
    roadmap: [
      "Learn design principles and color theory",
      "Practice typography and layout design",
      "Create graphics using a design tool",
      "Develop branding and social media projects",
      "Build a portfolio of original designs",
    ],
    skillGapKey: "uiux",
  },
  {
    id: 5,
    title: "Digital Marketer",
    category: "Business",
    description:
      "Help businesses reach audiences through search engines, content, social media, and digital campaigns.",
    responsibilities: [
      "Plan and manage digital marketing campaigns.",
      "Research audiences and keywords.",
      "Create and optimize marketing content.",
      "Measure campaign performance and report results.",
    ],
    skills: [
      "SEO",
      "Content Marketing",
      "Social Media Marketing",
      "Analytics",
      "Campaign Planning",
    ],
    tools: [
      "Google Analytics",
      "Google Search Console",
      "Google Ads",
      "Canva",
    ],
    roadmap: [
      "Learn digital marketing fundamentals",
      "Understand SEO and keyword research",
      "Practice content and social media marketing",
      "Learn campaign analytics and reporting",
      "Create sample campaigns and a portfolio",
    ],
    skillGapKey: "marketing",
  },
  {
    id: 6,
    title: "Business Analyst",
    category: "Business",
    description:
      "Analyze business needs, document requirements, and help teams make informed decisions.",
    responsibilities: [
      "Gather and document business requirements.",
      "Analyze processes and identify improvements.",
      "Prepare reports and interpret business data.",
      "Communicate findings with stakeholders.",
    ],
    skills: [
      "Analytical Thinking",
      "Communication",
      "Excel",
      "Requirements Gathering",
      "Data Interpretation",
    ],
    tools: ["Microsoft Excel", "Power BI", "Jira", "SQL"],
    roadmap: [
      "Learn business analysis fundamentals",
      "Practice Excel and data analysis",
      "Learn requirements documentation",
      "Explore SQL and data visualization",
      "Create sample business analysis case studies",
    ],
    skillGapKey: "business",
  },
  {
    id: 7,
    title: "Teacher",
    category: "Education",
    description:
      "Help learners understand concepts, develop knowledge, and build useful skills.",
    responsibilities: [
      "Prepare lesson plans and learning materials.",
      "Explain concepts using suitable teaching methods.",
      "Assess student understanding and progress.",
      "Provide feedback and support learners.",
    ],
    skills: [
      "Communication",
      "Lesson Planning",
      "Classroom Management",
      "Subject Knowledge",
      "Assessment",
    ],
    tools: [
      "Google Classroom",
      "Microsoft PowerPoint",
      "Google Docs",
      "Learning Management Systems",
    ],
    roadmap: [
      "Develop strong subject knowledge",
      "Learn lesson planning and teaching methods",
      "Practice preparing learning materials",
      "Develop assessment and classroom skills",
      "Build teaching experience and a portfolio",
    ],
    skillGapKey: "education",
  },
  {
    id: 8,
    title: "Technical Trainer",
    category: "Education",
    description:
      "Teach practical software, programming, or technical skills through structured learning sessions.",
    responsibilities: [
      "Prepare technical training materials.",
      "Demonstrate software and technical workflows.",
      "Guide learners through practical exercises.",
      "Evaluate learning progress and improve training sessions.",
    ],
    skills: [
      "Technical Knowledge",
      "Presentation",
      "Communication",
      "Instructional Design",
      "Problem Solving",
    ],
    tools: [
      "PowerPoint",
      "Google Classroom",
      "Zoom",
      "Learning Management Systems",
    ],
    roadmap: [
      "Build expertise in a technical subject",
      "Practice explaining technical concepts simply",
      "Create lessons and hands-on exercises",
      "Learn assessment and instructional design",
      "Prepare a sample technical training session",
    ],
    skillGapKey: "education",
  },
];

function CareerDetails() {
  const { id } = useParams();
  const career = careers.find((item) => item.id === Number(id));

  if (!career) {
    return (
      <>
        <Navbar />
        <main className="career-details-page">
          <div className="career-details-container career-not-found">
            <h1>Career not found</h1>
            <p>The career you're looking for doesn't exist yet.</p>
            <Link to="/careers" className="career-back-link">
              Back to careers
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="career-details-page">
        <div className="career-details-container">
          <Link to="/careers" className="career-back-link">
            ← Back to all careers
          </Link>

          <section className="career-details-hero">
            <span className="career-details-category">
              {career.category}
            </span>

            <h1>{career.title}</h1>
            <p>{career.description}</p>
            <span className="career-details-level">Entry Level</span>
          </section>

          <section className="career-details-section">
            <h2>What you'll do</h2>
            <div className="career-detail-list">
              {career.responsibilities.map((item) => (
                <div className="career-detail-item" key={item}>
                  <span className="career-check">✓</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="career-details-section">
            <h2>Skills you'll need</h2>
            <p className="career-section-description">
              Start with the fundamentals and build your skills through practice.
            </p>
            <div className="career-detail-tags">
              {career.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </section>

          <section className="career-details-section">
            <h2>Recommended tools</h2>
            <div className="career-detail-tags tool-tags">
              {career.tools.map((tool) => (
                <span key={tool}>{tool}</span>
              ))}
            </div>
          </section>

          <section className="career-details-section roadmap-section">
            <h2>Your learning roadmap</h2>
            <p className="career-section-description">
              Follow these suggested steps in order. Adjust your learning plan
              as your goals develop.
            </p>

            <div className="career-roadmap">
              {career.roadmap.map((step, index) => (
                <div className="career-roadmap-step" key={step}>
                  <span className="roadmap-number">{index + 1}</span>
                  <div>
                    <span className="roadmap-label">
                      STEP {index + 1}
                    </span>
                    <h3>{step}</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="career-details-cta">
            <div>
              <h2>Ready to understand your skill gaps?</h2>
              <p>
                Compare your current skills with the skills you may need for
                your chosen career.
              </p>
            </div>

            <Link
              to={`/skill-gap?career=${career.skillGapKey}`}
              className="career-details-skill-btn"
            >
              Check my skills <span>→</span>
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}

export default CareerDetails;
