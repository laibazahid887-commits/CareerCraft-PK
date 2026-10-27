import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Careers.css";

const careers = [
  {
    id: 1,
    title: "Frontend Developer",
    category: "Technology",
    description: "Build responsive websites and interactive user interfaces.",
    skills: ["HTML & CSS", "JavaScript", "React"],
    icon: "</>",
    level: "Entry Level",
  },
  {
    id: 2,
    title: "Backend Developer",
    category: "Technology",
    description: "Develop server-side applications, APIs, and database systems.",
    skills: ["Node.js", "Express", "SQL"],
    icon: "{ }",
    level: "Entry Level",
  },
  {
    id: 3,
    title: "UI/UX Designer",
    category: "Design",
    description: "Design accessible, intuitive, and user-friendly digital products.",
    skills: ["Figma", "Wireframes", "Prototyping"],
    icon: "✳",
    level: "Entry Level",
  },
  {
    id: 4,
    title: "Graphic Designer",
    category: "Design",
    description: "Create visual content for brands, campaigns, and digital media.",
    skills: ["Typography", "Canva", "Branding"],
    icon: "◈",
    level: "Entry Level",
  },
  {
    id: 5,
    title: "Digital Marketer",
    category: "Business",
    description: "Help businesses reach audiences through digital campaigns.",
    skills: ["SEO", "Social Media", "Analytics"],
    icon: "↗",
    level: "Entry Level",
  },
  {
    id: 6,
    title: "Business Analyst",
    category: "Business",
    description: "Analyze business needs and turn data into useful insights.",
    skills: ["Communication", "Excel", "Analysis"],
    icon: "▤",
    level: "Entry Level",
  },
  {
    id: 7,
    title: "Teacher",
    category: "Education",
    description: "Help learners understand concepts and develop new skills.",
    skills: ["Communication", "Planning", "Teaching"],
    icon: "✎",
    level: "Entry Level",
  },
  {
    id: 8,
    title: "Technical Trainer",
    category: "Education",
    description: "Teach practical software, programming, or technical skills.",
    skills: ["Presentation", "Technical Skills", "Mentoring"],
    icon: "⌘",
    level: "Entry Level",
  },
];

const categories = ["All Careers", "Technology", "Design", "Business", "Education"];

function Careers() {
    const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Careers");

  const filteredCareers = careers.filter((career) => {
    const matchesCategory =
      activeCategory === "All Careers" ||
      career.category === activeCategory;

    const searchableText = [
      career.title,
      career.category,
      career.description,
      ...career.skills,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(
      searchTerm.trim().toLowerCase()
    );

    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Navbar />

      <main className="careers-page">
        <section className="careers-hero">
          <div className="careers-container">
            <span className="careers-eyebrow">
              EXPLORE YOUR POSSIBILITIES
            </span>

            <h1>
              Discover a career path
              <br />
              <span>that fits your goals.</span>
            </h1>

            <p>
              Explore career options, discover their essential skills,
              and find a direction for your professional journey.
            </p>

            <div className="careers-stats">
              <div>
                <strong>Technology</strong>
                <span>Build digital solutions</span>
              </div>
              <div>
                <strong>Design & Creative</strong>
                <span>Create meaningful experiences</span>
              </div>
              <div>
                <strong>Business & Education</strong>
                <span>Explore diverse opportunities</span>
              </div>
            </div>
          </div>
        </section>

        <section className="career-catalogue">
          <div className="careers-container">
            <div className="catalogue-heading">
              <div>
                <span className="careers-eyebrow">CAREER CATALOGUE</span>
                <h2>Explore your options</h2>
                <p>Find roles that match your interests and goals.</p>
              </div>

              <span className="career-count">
                {filteredCareers.length}{" "}
                {filteredCareers.length === 1 ? "career" : "careers"}
              </span>
            </div>

            <div className="career-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search careers, categories, or skills..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Search careers"
              />
            </div>

            <div className="career-filters" aria-label="Filter career categories">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={
                    activeCategory === category
                      ? "career-filter active"
                      : "career-filter"
                  }
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={activeCategory === category}
                >
                  {category}
                </button>
              ))}
            </div>

            {filteredCareers.length > 0 ? (
              <div className="career-grid">
                {filteredCareers.map((career) => (
                  <article className="career-card" key={career.id}>
                    <div className="career-card-top">
                      <div className="career-card-icon">{career.icon}</div>
                      <span className="career-level">{career.level}</span>
                    </div>

                    <span className="career-category">
                      {career.category}
                    </span>

                    <h3>{career.title}</h3>
                    <p className="career-description">
                      {career.description}
                    </p>

                    <div className="career-skills">
                      {career.skills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>

                    <button
  type="button"
  className="career-details-button"
  onClick={() => navigate(`/careers/${career.id}`)}
>
  Explore this career <span>→</span>
</button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="career-empty">
                <div className="empty-icon">⌕</div>
                <h3>No careers found</h3>
                <p>Try another search term or choose a different category.</p>
                <button
                  type="button"
                  className="career-reset-button"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveCategory("All Careers");
                  }}
                >
                  Clear search and filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default Careers;