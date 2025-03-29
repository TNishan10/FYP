import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { message } from "antd";
import { useAuth } from "../../contexts/AuthContext";

// For routes that any authenticated user can access
export const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth(); // Add loading state

  useEffect(() => {
    // Skip check if still loading
    if (loading) return;

    console.log("Protected route check:", isAuthenticated());
    if (!isAuthenticated()) {
      message.error("Please login to access this page");
      navigate("/login");
    }
  }, [navigate, isAuthenticated, loading]);

  // Don't render children during loading
  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
};

// For user-only routes (non-admin)
export const UserRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Skip check if still loading
    if (loading) return;

    // Debug info - helps identify what's happening
    console.log(`UserRoute check for path: ${location.pathname}`);
    console.log("Auth state:", {
      isAuthenticated: isAuthenticated(),
      isAdmin: isAdmin(),
    });

    if (!isAuthenticated()) {
      message.error("Please login to access this page");
      navigate("/login");
      return;
    }

    // Explicit check for root path to ensure proper protection
    if (isAdmin() && location.pathname === "/") {
      console.log("Admin accessing root path, redirecting to admin dashboard");
      message.error("Admins should use the admin dashboard");
      // Use replace instead of navigate to prevent history buildup
      navigate("/admin", { replace: true });
      return;
    }
  }, [navigate, isAdmin, isAuthenticated, loading, location.pathname]);

  // Don't render children during loading or redirects
  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Skip check if still loading
    if (loading) return;

    console.log("Admin route check:", isAuthenticated(), isAdmin());

    if (!isAuthenticated()) {
      message.error("Please login to access this page");
      navigate("/login");
      return;
    }

    if (!isAdmin()) {
      console.log("Not admin, redirecting");
      message.error("You don't have permission to access this page");
      navigate("/");
    }
  }, [navigate, isAdmin, isAuthenticated, loading]);

  // Don't render children during loading
  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
};
