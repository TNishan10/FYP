import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

/**
 * Custom hook for authentication functionality
 */
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Check if user is authenticated
  const checkAuth = () => {
    setLoading(true);
    const token = getStoredToken();

    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
      return false;
    }

    try {
      // Validate token and extract user info
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        // Token expired
        logout();
        setLoading(false);
        return false;
      }

      // Token valid, set user info
      setUser({
        id: decodedToken.id,
        name: decodedToken.name,
        email: decodedToken.email,
      });
      setIsAdmin(decodedToken.isAdmin === true);
      setIsAuthenticated(true);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      logout();
      setLoading(false);
      return false;
    }
  };

  // Get stored token from session/local storage
  const getStoredToken = () => {
    const sessionToken = sessionStorage.getItem("token");
    if (sessionToken) return sessionToken;

    const localToken = localStorage.getItem("token");
    if (localToken) {
      // Copy to session storage for consistency
      sessionStorage.setItem("token", localToken);
      return localToken;
    }

    return null;
  };

  // Login function
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }

      // Store token and user info
      const { token, user } = data.data;

      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", user.isAdmin ? "admin" : "user");
      }

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("userId", user.id);
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("userRole", user.isAdmin ? "admin" : "user");

      // Set authentication state
      setUser(user);
      setIsAuthenticated(true);
      setIsAdmin(user.isAdmin === true);

      return {
        success: true,
        user,
        token,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.message || "An error occurred during login",
      };
    }
  };

  // Logout function
  const logout = () => {
    // Clear all auth data
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");

    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);

    return true;
  };

  // Check if user account email is verified
  const checkEmailVerified = async (userId, token) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/auth/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      return data.success && data.user && data.user.isVerified;
    } catch (error) {
      console.error("Error checking email verification:", error);
      return false;
    }
  };

  return {
    isAuthenticated,
    isAdmin,
    user,
    loading,
    login,
    logout,
    checkAuth,
    checkEmailVerified,
  };
};

export default useAuth;
