import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./SkillGap.css";

const careerSkills = {
  frontend: {
    title: "Frontend Developer",
    description:
      "Build responsive websites and interactive user interfaces.",
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Git and GitHub",
    ],
  },

  backend: {
    title: "Backend Developer",
    description:
      "Build APIs, server-side applications, and databases.",
    skills: [
      "JavaScript",
      "Node.js",
      "Express",
      "PostgreSQL",
      "REST APIs",
    ],
  },

  uiux: {
    title: "UI/UX Designer",
    description:
      "Design accessible and user-friendly digital experiences.",
    skills: [
      "Figma",
      "Wireframing",
      "Prototyping",
      "Typography",
      "User Research",
    ],
  },

  graphic: {
    title: "Graphic Designer",
    description:
      "Create visual content, brand identities, and marketing designs.",
    skills: [
      "Typography",
      "Color Theory",
      "Layout Design",
      "Branding",
      "Visual Communication",
    ],
  },

  marketing: {
    title: "Digital Marketer",
    description:
      "Reach audiences and grow businesses through digital marketing campaigns.",
    skills: [
      "SEO",
      "Content Marketing",
      "Social Media Marketing",
      "Analytics",
      "Campaign Planning",
    ],
  },

  business: {
    title: "Business Analyst",
    description:
      "Analyze business needs, document requirements, and interpret data.",
    skills: [
      "Analytical Thinking",
      "Communication",
      "Excel",
      "Requirements Gathering",
      "Data Interpretation",
    ],
  },

  education: {
    title: "Teacher",
    description:
      "Plan lessons, support learners, and assess student progress.",
    skills: [
      "Communication",
      "Lesson Planning",
      "Classroom Management",
      "Subject Knowledge",
      "Assessment",
      "Teaching Methods",
      "Student Engagement",
      "Learning Materials",
    ],
  },

  technicalTraining: {
    title: "Technical Trainer",
    description:
      "Teach technical concepts through structured lessons and practical exercises.",
    skills: [
      "Technical Knowledge",
      "Presentation",
      "Communication",
      "Instructional Design",
      "Problem Solving",
    ],
  },
};

function getCareerKey(requestedCareer) {
  return careerSkills[requestedCareer] ? requestedCareer : "frontend";
}

function getSavedSkills(careerKey) {
  try {
    const savedSkills = localStorage.getItem(
      `careerCraftSkills_${careerKey}`
    );

    const parsedSkills = savedSkills ? JSON.parse(savedSkills) : [];

    if (!Array.isArray(parsedSkills)) {
      return [];
    }

    return parsedSkills.filter((skill) =>
      careerSkills[careerKey].skills.includes(skill)
    );
  } catch {
    return [];
  }
}

function SkillGap() {
  const [searchParams] = useSearchParams();
  const requestedCareer = searchParams.get("career");

  const [selectedCareer, setSelectedCareer] = useState(() =>
    getCareerKey(requestedCareer)
  );

  const [skillsByCareer, setSkillsByCareer] = useState(() => {
    const initialSkills = {};

    Object.keys(careerSkills).forEach((careerKey) => {
      initialSkills[careerKey] = getSavedSkills(careerKey);
    });

    return initialSkills;
  });

  // Follow career links and URL changes without overwriting saved skills.
  useEffect(() => {
    setSelectedCareer(getCareerKey(requestedCareer));
  }, [requestedCareer]);

  // Save each career's selections under its own localStorage key.
  useEffect(() => {
    Object.keys(careerSkills).forEach((careerKey) => {
      try {
        localStorage.setItem(
          `careerCraftSkills_${careerKey}`,
          JSON.stringify(skillsByCareer[careerKey] || [])
        );
      } catch (error) {
        console.error(
          `Unable to save skills for ${careerKey}:`,
          error
        );
      }
    });
  }, [skillsByCareer]);

  const career = careerSkills[selectedCareer];
  const mySkills = skillsByCareer[selectedCareer] || [];

  const matchedSkills = career.skills.filter((skill) =>
    mySkills.includes(skill)
  );

  const missingSkills = career.skills.filter(
    (skill) => !mySkills.includes(skill)
  );

  const progress = Math.round(
    (matchedSkills.length / career.skills.length) * 100
  );

  function handleCareerChange(careerKey) {
    setSelectedCareer(careerKey);
  }

  function handleSkillChange(skill) {
    setSkillsByCareer((current) => {
      const currentSkills = current[selectedCareer] || [];

      const updatedSkills = currentSkills.includes(skill)
        ? currentSkills.filter((item) => item !== skill)
        : [...currentSkills, skill];

      return {
        ...current,
        [selectedCareer]: updatedSkills,
      };
    });
  }

  return (
    <>
      <Navbar />

      <main className="skill-gap-page">
        <div className="skill-gap-container">
          <Link to="/careers" className="skill-gap-back">
            ← Back to careers
          </Link>

          <section className="skill-gap-hero">
            <span className="skill-gap-eyebrow">
              CAREER DEVELOPMENT TOOL
            </span>

            <h1>
              Understand your <span>skill gaps.</span>
            </h1>

            <p>
              Choose your target career, select the skills you
              already have, and identify what to learn next.
            </p>
          </section>

          <section className="skill-gap-panel">
            <div className="skill-gap-section-heading">
              <span className="skill-gap-step">01</span>

              <div>
                <h2>Choose your target career</h2>
                <p>Select the career you are preparing for.</p>
              </div>
            </div>

            <div className="skill-gap-career-options">
              {Object.entries(careerSkills).map(([key, item]) => (
                <button
                  type="button"
                  key={key}
                  className={
                    selectedCareer === key
                      ? "skill-gap-career-option active"
                      : "skill-gap-career-option"
                  }
                  onClick={() => handleCareerChange(key)}
                  aria-pressed={selectedCareer === key}
                >
                  <span>{item.title}</span>

                  <span className="skill-gap-option-icon">
                    {selectedCareer === key ? "✓" : "+"}
                  </span>
                </button>
              ))}
            </div>

            <div className="skill-gap-section-heading skill-gap-skills-heading">
              <span className="skill-gap-step">02</span>

              <div>
                <h2>Which skills do you already have?</h2>
                <p>{career.description}</p>
                <p>
                  Select each skill you can currently use.
                  Your selections are saved separately for each career.
                </p>
              </div>
            </div>

            <div className="skill-gap-skill-list">
              {career.skills.map((skill) => {
                const isSelected = mySkills.includes(skill);

                return (
                  <label
                    className={
                      isSelected
                        ? "skill-gap-skill selected"
                        : "skill-gap-skill"
                    }
                    key={`${selectedCareer}-${skill}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSkillChange(skill)}
                    />

                    <span className="skill-gap-checkbox">
                      {isSelected ? "✓" : ""}
                    </span>

                    <span className="skill-gap-skill-name">
                      {skill}
                    </span>
                  </label>
                );
              })}
            </div>

            <p className="skill-gap-note">
              Tip: Select only the skills you feel comfortable
              using in practice. You can update your selections
              whenever you learn something new.
            </p>
          </section>

          <section className="skill-gap-results">
            <div className="skill-gap-section-heading">
              <span className="skill-gap-step">03</span>

              <div>
                <h2>Your skill-gap results</h2>
                <p>
                  Your results update automatically when you
                  change your selections.
                </p>
              </div>
            </div>

            <div className="skill-gap-summary">
              <div className="skill-gap-summary-card">
                <span>Skills matched</span>
                <strong>
                  {matchedSkills.length}/{career.skills.length}
                </strong>
              </div>

              <div className="skill-gap-summary-card">
                <span>Skills to learn</span>
                <strong>{missingSkills.length}</strong>
              </div>

              <div className="skill-gap-summary-card">
                <span>Skill coverage</span>
                <strong>{progress}%</strong>
              </div>
            </div>

            <div className="skill-gap-progress">
              <div className="skill-gap-progress-label">
                <span>Your current skill coverage</span>
                <strong>{progress}%</strong>
              </div>

              <div
                className="skill-gap-progress-track"
                role="progressbar"
                aria-label="Current skill coverage"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="skill-gap-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="skill-gap-result-columns">
              <div className="skill-gap-result-group">
                <h3>
                  <span className="result-dot matched-dot" />
                  Skills you selected
                </h3>

                {matchedSkills.length > 0 ? (
                  matchedSkills.map((skill) => (
                    <div className="skill-gap-result-item" key={skill}>
                      <span>✓</span>
                      {skill}
                    </div>
                  ))
                ) : (
                  <p className="skill-gap-empty">
                    No skills selected yet.
                  </p>
                )}
              </div>

              <div className="skill-gap-result-group">
                <h3>
                  <span className="result-dot missing-dot" />
                  Skills to focus on
                </h3>

                {missingSkills.length > 0 ? (
                  missingSkills.map((skill) => (
                    <div className="skill-gap-result-item" key={skill}>
                      <span>＋</span>
                      {skill}
                    </div>
                  ))
                ) : (
                  <p className="skill-gap-empty">
                    Great! You have selected all listed skills.
                  </p>
                )}
              </div>
            </div>

            <div className="skill-gap-footer">
              <p>
                This result is a self-assessment based on the
                listed skills. It is not a formal qualification
                or job-readiness score.
              </p>

              <Link
                to="/job-analyzer"
                className="skill-gap-explore-link"
              >
                Analyze a Job Description →
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default SkillGap;
