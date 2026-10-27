import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      navigate("/login", {
        state: { message: "Account created successfully. Please log in." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          CareerCraft <span>PK</span>
        </Link>

        <h1>Create your account</h1>
        <p className="auth-subtitle">
          Start building your personalized career journey.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="full_name">Full name</label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange}
            minLength={8}
            required
          />

          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Enter your password again"
            value={formData.confirmPassword}
            onChange={handleChange}
            minLength={8}
            required
          />

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;