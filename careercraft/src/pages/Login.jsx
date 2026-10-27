
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const successMessage = location.state?.message;

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
    setLoading(true);

    try {
      const response = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      // The authService returns response.data from Axios.
      // The backend should therefore provide response.token.
      const token = response?.token;

      if (!response?.success || !token) {
        throw new Error(
          response?.message ||
            "Login failed: the server did not return an authentication token."
        );
      }

      // Save the authentication token.
      sessionStorage.setItem("careerCraftToken", token);

      // Update the authenticated user.
      setUser(response.data ?? null);

      // Return the user to the requested page, or the homepage.
      const destination = location.state?.from?.pathname || "/";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please check your email and password."
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

        <h1>Welcome back</h1>

        <p className="auth-subtitle">
          Log in to continue your career journey.
        </p>

        {successMessage && (
          <p className="auth-success" role="status">
            {successMessage}
          </p>
        )}

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
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
            autoComplete="current-password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
