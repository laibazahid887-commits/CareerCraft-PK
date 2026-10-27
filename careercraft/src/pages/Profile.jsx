
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfile, updateProfile } from "../services/profileService";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "./Profile.css";

const initialFormData = {
  education_level: "",
  field_of_study: "",
  career_goal: "",
  experience_level: "",
  location: "",
  bio: "",
};

function Profile() {
  const { user } = useAuth();

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await getProfile();

        if (response.data) {
          setFormData({
            ...initialFormData,
            ...response.data,
          });
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load your profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await updateProfile(formData);

      if (response.data) {
        setFormData((current) => ({
          ...current,
          ...response.data,
        }));
      }

      setSuccess("Your profile has been saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="profile-page">
        <Navbar />
        <p className="profile-status">Loading your profile...</p>
      </main>
    );
  }

  return (
    <>
      <Navbar />

      <main className="profile-page">
        <section className="profile-container">
          <div className="profile-heading">
            <div>
              <p className="profile-eyebrow">YOUR ACCOUNT</p>
              <h1>My Profile</h1>
              <p className="profile-description">
                Tell us about your background and career goals to help
                personalize your career journey.
              </p>
            </div>

            <Link to="/" className="profile-back-link">
              Back to Home
            </Link>
          </div>

          <section className="profile-card">
            <div className="profile-user">
              <div className="profile-avatar" aria-hidden="true">
                {(user?.full_name || "U").charAt(0).toUpperCase()}
              </div>

              <div>
                <h2>{user?.full_name || "Your Account"}</h2>
                <p>{user?.email || ""}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="profile-form-grid">
                <div className="profile-field">
                  <label htmlFor="education_level">
                    Education Level
                  </label>
                  <select
                    id="education_level"
                    name="education_level"
                    value={formData.education_level}
                    onChange={handleChange}
                  >
                    <option value="">Select education level</option>
                    <option value="High School">High School</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelor's">Bachelor's Degree</option>
                    <option value="Master's">Master's Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="profile-field">
                  <label htmlFor="field_of_study">
                    Field of Study
                  </label>
                  <input
                    id="field_of_study"
                    name="field_of_study"
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={formData.field_of_study}
                    onChange={handleChange}
                    maxLength={100}
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="career_goal">Career Goal</label>
                  <input
                    id="career_goal"
                    name="career_goal"
                    type="text"
                    placeholder="e.g. React Developer"
                    value={formData.career_goal}
                    onChange={handleChange}
                    maxLength={100}
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="experience_level">
                    Experience Level
                  </label>
                  <select
                    id="experience_level"
                    name="experience_level"
                    value={formData.experience_level}
                    onChange={handleChange}
                  >
                    <option value="">Select experience level</option>
                    <option value="Student">Student</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>

                <div className="profile-field profile-field-full">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="e.g. Pakistan"
                    value={formData.location}
                    onChange={handleChange}
                    maxLength={100}
                  />
                </div>

                <div className="profile-field profile-field-full">
                  <label htmlFor="bio">About Me</label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    placeholder="Briefly describe your background and interests..."
                    value={formData.bio}
                    onChange={handleChange}
                    maxLength={1000}
                  />
                  <span className="profile-character-count">
                    {formData.bio.length}/1000 characters
                  </span>
                </div>
              </div>

              {error && (
                <p className="profile-message profile-error" role="alert">
                  {error}
                </p>
              )}

              {success && (
                <p
                  className="profile-message profile-success"
                  role="status"
                >
                  {success}
                </p>
              )}

              <div className="profile-form-actions">
                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </section>
        </section>
      </main>
    </>
  );
}

export default Profile;
