
import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const token = sessionStorage.getItem("careerCraftToken");

      if (!token) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await getCurrentUser(token);

        if (isMounted) {
          setUser(response?.data ?? null);
        }
      } catch (error) {
        const status = error?.response?.status;

        if (status === 401 || status === 403) {
          // Clear the token only when authentication is rejected.
          sessionStorage.removeItem("careerCraftToken");

          if (isMounted) {
            setUser(null);
          }
        } else {
          // Keep the token if the request failed for another reason.
          console.error("Unable to verify the current user:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  function logout() {
    sessionStorage.removeItem("careerCraftToken");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
