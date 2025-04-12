import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { message } from "antd";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = () => {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUser({
            ...decoded,
            isAuthenticated: true,
            isAdmin: decoded.isAdmin || false, // Add isAdmin to user object
          });
        } catch (error) {
          console.error("Invalid token:", error);
          sessionStorage.removeItem("token");
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function that redirects based on role
  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", credentials);
      const { token } = response.data;

      if (token) {
        sessionStorage.setItem("token", token);
        localStorage.setItem("token", token);

        // Add this line to store the email
        localStorage.setItem("userEmail", email);

        // Set user in context
        const decodedToken = jwtDecode(token);
        setUser({
          ...decodedToken,
          isAuthenticated: true,
          isAdmin: decodedToken.isAdmin || false, // Add isAdmin to user object
        });

        // Return role for redirection
        return decodedToken.isAdmin ? "/admin" : "/";
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    try {
      console.log("Starting logout process");

      // List all keys we want to clear
      const keysToRemove = [
        "token",
        "userEmail",
        "isLoggedIn",
        "userId",
        "userRole",
        "pendingVerificationEmail",
      ];

      // First set all items to empty strings (safer than direct removal)
      console.log("Nullifying session storage values...");
      keysToRemove.forEach((key) => {
        sessionStorage.setItem(key, "");
        console.log(`Nullified ${key} in sessionStorage`);
      });

      // Now do the same for localStorage
      console.log("Nullifying local storage values...");
      keysToRemove.forEach((key) => {
        localStorage.setItem(key, "");
        console.log(`Nullified ${key} in localStorage`);
      });

      // Now try removing items
      keysToRemove.forEach((key) => {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
        console.log(`Removed ${key} from both storages`);
      });

      // Finally try the clear methods
      console.log("Final clear attempt");
      sessionStorage.clear();

      // Reset React state
      setUser(null);

      // Print final state to verify
      console.log("Final sessionStorage:", Object.keys(sessionStorage));
      console.log(
        "Final localStorage relevant keys:",
        keysToRemove.filter((key) => localStorage.getItem(key))
      );

      console.log("Logout completed successfully");

      // Force redirect to login
      window.location.href = "/login"; // This will completely reload the page
    } catch (error) {
      console.error("Error during logout:", error);
      // Force redirect anyway
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return {
    ...context,
    isAdmin: () => {
      // First check context.user if available
      if (context.user?.isAdmin === true) {
        console.log("Admin via context");
        return true;
      }

      // Fallback to localStorage/sessionStorage
      const userRole =
        localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      if (userRole === "admin") {
        console.log("Admin via localStorage");
        return true;
      }

      if (token) {
        try {
          const decoded = jwtDecode(token);
          console.log("Token decoded:", decoded);
          return decoded.isAdmin === true;
        } catch (error) {
          console.error("Token decode failed:", error);
        }
      }

      return false;
    },
    isAuthenticated: () => {
      // First check context.user if available
      if (context.user?.isAuthenticated === true) {
        return true;
      }

      // Fallback to localStorage/sessionStorage
      const isLoggedIn =
        localStorage.getItem("isLoggedIn") === "true" ||
        sessionStorage.getItem("isLoggedIn") === "true";
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      if (isLoggedIn && token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          if (decoded.exp > currentTime) {
            return true;
          }
        } catch (error) {
          console.error("Token validation failed:", error);
        }
      }

      return false;
    },
  };
};
