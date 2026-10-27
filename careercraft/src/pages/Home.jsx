
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Home.css";

const careerTools = [
  {
    number: "01",
    title: "Career Explorer",
    description:
      "Explore career options, understand different roles, and discover which paths match your interests.",
    link: "/careers",
    linkText: "Explore careers",
  },
  {
    number: "02",
    title: "Skill Gap Analysis",
    description:
      "Compare your current skills with the skills needed for your target career and identify what to learn next.",
    link: "/skill-gap",
    linkText: "Analyze skills",
  },
  {
    number: "03",
    title: "Job Description Analyzer",
    description:
      "Review job descriptions to understand required skills, preferred qualifications, and employer expectations.",
    link: "/job-analyzer",
    linkText: "Analyze a job",
  },
  {
    number: "04",
    title: "Learning Roadmap",
    description:
      "Organize your learning into manageable steps so you can work toward your career goals with more direction.",
    link: "/roadmap",
    linkText: "View roadmap",
  },
  {
    number: "05",
    title: "CV Builder",
    description:
      "Create a clear, professional CV that presents your education, skills, and experience effectively.",
    link: "/cv-generator",
    linkText: "Build your CV",
  },
];

const careerCategories = [
  {
    title: "Technology & IT",
    description: "Build digital products and solve technical problems.",
    careers: "Web Developer · Software Developer · IT Support",
  },
  {
    title: "Design & Creative",
    description: "Turn ideas into useful and engaging experiences.",
    careers: "UI/UX Designer · Graphic Designer · Product Designer",
  },
  {
    title: "Business & Marketing",
    description: "Understand customers, markets, and business needs.",
    careers: "Digital Marketer · Business Analyst · SEO Specialist",
  },
  {
    title: "Education & Training",
    description: "Share knowledge and help others develop new skills.",
    careers: "Teacher · Technical Trainer · Learning Designer",
  },
];

function Home() {
  return (
    <>
      <Navbar />

      <main className="home-page">
        {/* Hero */}
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <span className="hero-badge">
                Career guidance for your next step
              </span>

              <h1>
                Turn your career goals into a{" "}
                <span>clear plan.</span>
              </h1>

              <p className="hero-description">
                Discover career options, identify the skills you need,
                prepare for job opportunities, and build a professional CV
                — all in one place.
              </p>

              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary">
                  Get Started
                  <span aria-hidden="true">→</span>
                </Link>

                <Link to="/careers" className="btn btn-secondary">
                  Explore Careers
                </Link>
              </div>

              <p className="hero-note">
                A practical starting point for students and fresh graduates.
              </p>
            </div>

            <div className="hero-visual">
              <div className="career-overview">
                <div className="overview-header">
                  <div>
                    <span className="overview-eyebrow">
                      YOUR CAREER WORKSPACE
                    </span>
                    <h2>Plan your next move</h2>
                  </div>

                  <span className="overview-icon" aria-hidden="true">
                    ↗
                  </span>
                </div>

                <div className="overview-divider" />

                <div className="overview-item">
                  <div className="overview-item-icon career-icon">
                    <span aria-hidden="true">⌕</span>
                  </div>
                  <div className="overview-item-content">
                    <h3>Explore career paths</h3>
                    <p>Understand roles and opportunities</p>
                  </div>
                  <span className="overview-arrow" aria-hidden="true">
                    →
                  </span>
                </div>

                <div className="overview-item">
                  <div className="overview-item-icon skills-icon">
                    <span aria-hidden="true">✓</span>
                  </div>
                  <div className="overview-item-content">
                    <h3>Identify skill gaps</h3>
                    <p>Find skills to improve</p>
                  </div>
                  <span className="overview-arrow" aria-hidden="true">
                    →
                  </span>
                </div>

                <div className="overview-item">
                  <div className="overview-item-icon cv-icon">
                    <span aria-hidden="true">▤</span>
                  </div>
                  <div className="overview-item-content">
                    <h3>Prepare for applications</h3>
                    <p>Analyze jobs and build your CV</p>
                  </div>
                  <span className="overview-arrow" aria-hidden="true">
                    →
                  </span>
                </div>

                <div className="overview-footer">
                  <span className="overview-footer-dot" />
                  <p>Start with one step. Build from there.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Career tools */}
        <section className="tools-section" id="career-tools">
          <div className="home-section-container">
            <div className="section-heading">
              <span className="section-eyebrow">YOUR CAREER TOOLKIT</span>
              <h2>Everything you need to move forward</h2>
              <p>
                Use practical tools to understand your options and prepare
                for the opportunities you want.
              </p>
            </div>

            <div className="career-tools-grid">
              {careerTools.map((tool) => (
                <article className="career-tool-card" key={tool.number}>
                  <span className="tool-number">{tool.number}</span>

                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>

                  <Link to={tool.link} className="tool-link">
                    {tool.linkText}
                    <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="how-section" id="how-it-works">
          <div className="home-section-container">
            <div className="section-heading">
              <span className="section-eyebrow">HOW IT WORKS</span>
              <h2>A more focused way to plan your career</h2>
              <p>
                Start with your goal, understand what it requires, and
                decide what to work on next.
              </p>
            </div>

            <div className="steps-grid">
              <article className="step-card">
                <span className="step-number">01</span>
                <h3>Choose a direction</h3>
                <p>
                  Explore career paths and select a role that interests you.
                </p>
              </article>

              <article className="step-card">
                <span className="step-number">02</span>
                <h3>Understand the requirements</h3>
                <p>
                  Review the skills, qualifications, and preparation your
                  chosen role may require.
                </p>
              </article>

              <article className="step-card">
                <span className="step-number">03</span>
                <h3>Take the next step</h3>
                <p>
                  Follow a learning plan, analyze job descriptions, and
                  prepare your CV.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Career categories */}
        <section className="categories-section" id="career-categories">
          <div className="home-section-container">
            <div className="categories-heading">
              <div className="section-heading">
                <span className="section-eyebrow">EXPLORE YOUR OPTIONS</span>
                <h2>Find a field that interests you</h2>
                <p>
                  Start exploring different professional paths and the
                  roles within them.
                </p>
              </div>

              <Link to="/careers" className="text-link">
                View all careers <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="categories-grid">
              {careerCategories.map((category, index) => (
                <article className="category-card" key={category.title}>
                  <span className="category-index">
                    0{index + 1}
                  </span>

                  <h3>{category.title}</h3>
                  <p>{category.description}</p>

                  <div className="category-careers">
                    {category.careers}
                  </div>

                  <Link
                    to="/careers"
                    className="category-link"
                    aria-label={`Explore ${category.title} careers`}
                  >
                    Explore field <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Final call to action */}
        <section className="final-cta-section">
          <div className="final-cta-container">
            <div>
              <span className="section-eyebrow">YOUR NEXT STEP STARTS HERE</span>
              <h2>Make your career plan actionable.</h2>
              <p>
                Begin with your career goal and use the right tools to work
                toward it, one step at a time.
              </p>
            </div>

            <div className="final-cta-actions">
              <Link to="/register" className="btn btn-cta">
                Create Your Account <span aria-hidden="true">→</span>
              </Link>

              <Link to="/careers" className="cta-secondary-link">
                Browse careers
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              CareerCraft <span>PK</span>
            </Link>
            <p>
              Practical career guidance and job preparation for your next step.
            </p>
          </div>

          <div className="footer-links-group">
            <h3>Explore</h3>
            <Link to="/careers">Careers</Link>
            <Link to="/job-analyzer">Job Analyzer</Link>
            <Link to="/cv-generator">CV Builder</Link>
          </div>

          <div className="footer-links-group">
            <h3>Get Started</h3>
            <Link to="/register">Create Account</Link>
            <Link to="/login">Log In</Link>
            <a href="#how-it-works">How It Works</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} CareerCraft PK. All rights reserved.
          </p>
          <p>Build your skills. Prepare for your future.</p>
        </div>
      </footer>
    </>
  );
}

export default Home;
