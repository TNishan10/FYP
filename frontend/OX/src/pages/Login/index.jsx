import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Modal } from "antd";
import { jwtDecode } from "jwt-decode";

import LoginLayout from "./components/LoginLayout";
import LoginForm from "./components/LoginForm";
import ForgotPasswordModal from "./components/ForgotPassword";
import { useAuth } from "../../contexts/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] =
    useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Modal state
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);

  // Check if user is already logged in when component mounts
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const token = sessionStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (isLoggedIn && token && userId) {
      navigate("/");
    }
  }, [navigate]);

  // Handle login form submission
  const handleLogin = async (values) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      console.log("Login Data:", data);

      if (data?.success === true) {
        // Remove any existing lockout data (optional)
        localStorage.removeItem("login_attempts");
        localStorage.removeItem("account_lockout");

        // Check if email is verified
        if (data.data.user.isVerified === false) {
          sessionStorage.setItem("pendingVerificationEmail", values.email);
          toast.info("Your email needs to be verified before logging in");
          navigate("/verify-email");
          return;
        }

        // Process successful login
        handleSuccessfulLogin(data, values.email);
      } else {
        toast.error(data?.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Backend Error:", error);
      toast.error("An error occurred during login");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle successful login and redirection
  const handleSuccessfulLogin = (data, email) => {
    try {
      // Decode the JWT token to check admin status
      const decodedToken = jwtDecode(data.data.token);
      const isAdmin = decodedToken.isAdmin;

      // Store auth data based on remember me setting
      if (rememberMe) {
        localStorage.setItem("userEmail", email);
        localStorage.setItem("isLoggedIn", true);
        localStorage.setItem("userId", data.data.user.id);
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("userRole", isAdmin ? "admin" : "user");
      } else {
        // Session storage
        sessionStorage.setItem("userEmail", email);
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userId", data.data.user.id);
        sessionStorage.setItem("token", data.data.token);
        sessionStorage.setItem("userRole", isAdmin ? "admin" : "user");

        // Also save minimal data in localStorage for app-wide checks
        localStorage.setItem("isLoggedIn", true);
        localStorage.setItem("userId", data.data.user.id);
        localStorage.setItem("userRole", isAdmin ? "admin" : "user");
      }

      // Show success toast
      toast.success("Login Success");

      // Add short delay to ensure toast is visible
      setTimeout(() => {
        if (isAdmin) {
          // User is admin, navigate to admin dashboard
          navigate("/admin");
        } else {
          // Regular user flow - check if they have submitted info
          checkUserInfo(data.data.user.id, data.data.token);
        }
      }, 500);
    } catch (error) {
      console.error("Error processing login:", error);
      toast.error("Error processing login. Please try again.");
    }
  };

  // Check if user has completed their profile
  const checkUserInfo = async (userId, token) => {
    try {
      const userInfoResponse = await fetch(
        `http://localhost:8000/api/v1/auth/users/${userId}/info`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const userInfoData = await userInfoResponse.json();

      if (userInfoResponse.ok && userInfoData.success && userInfoData.data) {
        // User info exists, navigate to home
        navigate("/");
      } else {
        // No user info yet, navigate to user info page
        navigate("/user-info");
      }
    } catch (error) {
      console.error("Error checking user info:", error);
      navigate("/user-info"); // Default to user info page
    }
  };

  // Forgot password modal handlers
  const handleForgotPasswordClick = (email) => {
    setForgotPasswordEmail(email);
    setForgotPasswordStep(1);
    setForgotPasswordModalVisible(true);
  };

  const resetForgotPasswordState = () => {
    setForgotPasswordStep(1);
    setForgotPasswordEmail("");
  };

  return (
    <LoginLayout>
      <LoginForm
        onSubmit={handleLogin}
        isSubmitting={isSubmitting}
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
        onForgotPassword={handleForgotPasswordClick}
      />

      <Modal
        open={forgotPasswordModalVisible}
        onCancel={() => {
          setForgotPasswordModalVisible(false);
          resetForgotPasswordState();
        }}
        footer={null}
        width={400}
        centered
      >
        <ForgotPasswordModal
          email={forgotPasswordEmail}
          setEmail={setForgotPasswordEmail}
          step={forgotPasswordStep}
          setStep={setForgotPasswordStep}
          onClose={() => setForgotPasswordModalVisible(false)}
        />
      </Modal>
    </LoginLayout>
  );
};

export default Login;
