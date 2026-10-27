
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="auth-page">
        <p>Checking your login status...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          message: "Please log in to access this feature.",
        }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
