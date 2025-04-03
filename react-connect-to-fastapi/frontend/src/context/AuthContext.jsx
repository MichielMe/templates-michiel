import { createContext, useContext, useState, useEffect } from "react";
import api from "./api";

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set token in localStorage and Axios headers
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Fetch current user details when token changes
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setUser(null);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get("/users/me");
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user:", err);
        // If token is invalid, log out
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      // FastAPI OAuth2 password flow expects x-www-form-urlencoded content type
      const params = new URLSearchParams();
      params.append("username", username); // OAuth2 uses 'username'
      params.append("password", password);

      const response = await api.post("/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      setToken(response.data.access_token);
      return response.data;
    } catch (err) {
      console.error("Login error:", err.response || err);
      setError(err.response?.data?.detail || "Invalid credentials");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
        register,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
