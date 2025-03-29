import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import COVER_IMAGE from "../assets/login.jpg";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Spin } from "antd";

const colors = {
  primary: "060606",
  background: "f5f5f5",
  disbaled: "D9D9D9",
};

const Login = () => {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [otpTimerActive, setOtpTimerActive] = useState(false);
  const [otpExpiryTime, setOtpExpiryTime] = useState(300);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Check if user is already logged in when component mounts
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const token = sessionStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (isLoggedIn && token && userId) {
      // User is already logged in, redirect to home page
      navigate("/");
    }

    const lockedUntil = localStorage.getItem("account_lockout");
    if (lockedUntil && new Date(lockedUntil) > new Date()) {
      const remainingTime = Math.ceil(
        (new Date(lockedUntil) - new Date()) / 1000 / 60
      );
      toast.error(
        `Account is temporarily locked. Try again in ${remainingTime} minutes.`
      );
    } else if (lockedUntil) {
      // Clear lockout if it's expired
      localStorage.removeItem("account_lockout");
      localStorage.removeItem("login_attempts");
    }
  }, [navigate]);

  useEffect(() => {
    let timer;
    if (otpTimerActive && otpExpiryTime > 0) {
      timer = setInterval(() => {
        setOtpExpiryTime((prev) => prev - 1);
      }, 1000);
    } else if (otpExpiryTime === 0) {
      setOtpTimerActive(false);
      toast.info("Verification code expired. Please request a new one.");
    }

    return () => clearInterval(timer);
  }, [otpTimerActive, otpExpiryTime]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password states
  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] =
    useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  // OTP input refs
  const otpInputRefs = Array(6)
    .fill(0)
    .map(() => React.createRef());

  // Update the handleLogin function in your Login.jsx
  const handleLogin = async (values) => {
    try {
      // Check if account is locked
      const lockedUntil = localStorage.getItem("account_lockout");
      if (lockedUntil && new Date(lockedUntil) > new Date()) {
        const timeLeft = Math.ceil(
          (new Date(lockedUntil) - new Date()) / 1000 / 60
        );
        toast.error(
          `Account temporarily locked. Try again in ${timeLeft} minutes.`
        );
        return;
      }
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
        // Reset login attempts on successful login
        localStorage.removeItem("login_attempts");
        localStorage.removeItem("account_lockout");

        // Check if email is verified
        if (data.data.user.isVerified === false) {
          // Store the email in sessionStorage for the verification page to use (more secure)
          sessionStorage.setItem("pendingVerificationEmail", values.email);
          // Show toast notification
          toast.info("Your email needs to be verified before logging in");

          // Navigate to verification page
          navigate("/verify-email");
          return;
        }
        if (rememberMe) {
          localStorage.setItem("userEmail", data.data.user.email);
          localStorage.setItem("isLoggedIn", true);
          localStorage.setItem("userId", data.data.user.id);
          localStorage.setItem("token", data.data.token);

          // Set cookie with expiration date (30 days)
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          document.cookie = `token=${
            data.data.token
          }; expires=${expiryDate.toUTCString()}; path=/; Secure; SameSite=Strict`;
        } else {
          // Use session storage which clears when browser closes
          sessionStorage.setItem("userEmail", data.data.user.email);
          sessionStorage.setItem("isLoggedIn", "true");
          sessionStorage.setItem("userId", data.data.user.id);
          sessionStorage.setItem("token", data.data.token);
          localStorage.setItem("isLoggedIn", true); // Keep this for compatibility
          localStorage.setItem("userId", data.data.user.id); // Keep this for compatibility
        }
        // Show success toast
        toast.success("Login Success");

        // Add delay before navigation to ensure toast is visible
        setTimeout(async () => {
          // Check if user has already submitted their info
          try {
            const userId = data.data.user.id;
            const userInfoResponse = await fetch(
              `http://localhost:8000/api/v1/auth/users/${userId}/info`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${data.data.token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            const userInfoData = await userInfoResponse.json();

            if (
              userInfoResponse.ok &&
              userInfoData.success &&
              userInfoData.data
            ) {
              // User info exists, navigate to home
              navigate("/");
            } else {
              // No user info yet, navigate to user info page
              navigate("/user-info");
            }
          } catch (error) {
            console.error("Error checking user info:", error);
            // Default to user info page if check fails
            navigate("/user-info");
          }
        }, 500); // .5 second delay
      } else {
        // Handle failed login attempts
        const attempts =
          parseInt(localStorage.getItem("login_attempts") || "0") + 1;
        localStorage.setItem("login_attempts", attempts);

        // Lock account after 5 failed attempts for 30 minutes
        if (attempts >= 5) {
          const lockUntil = new Date(Date.now() + 1 * 60000); // 1 minutes
          localStorage.setItem("account_lockout", lockUntil.toString());
          toast.error(
            "Too many failed login attempts. Account locked for 30 minutes."
          );
        } else {
          toast.error(
            data.message || `Login Failed (${5 - attempts} attempts remaining)`
          );
        }
      }
    } catch (error) {
      console.error("Backend Error:", error);
      toast.error("An error occurred during login");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle forgot password email submit
  const handleForgotPasswordEmailSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail)\.com$/i;
    if (!emailRegex.test(forgotPasswordEmail)) {
      toast.error(
        "Please enter a valid email from gmail.com, yahoo.com, or hotmail.com"
      );
      return;
    }

    setSendingOtp(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: forgotPasswordEmail }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("OTP sent to your email address");
        setForgotPasswordStep(2);

        // Start the OTP expiry timer
        setOtpExpiryTime(120); // 2 minutes in seconds
        setOtpTimerActive(true);

        // Focus on first OTP input
        setTimeout(() => {
          if (otpInputRefs[0].current) {
            otpInputRefs[0].current.focus();
          }
        }, 300);
      } else {
        toast.error(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again later.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    // Check if OTP has expired
    if (!otpTimerActive || otpExpiryTime <= 0) {
      toast.error("Verification code has expired. Please request a new one.");
      return;
    }

    const otpCode = forgotPasswordOtp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter the complete 6-character OTP");
      return;
    }

    setVerifyingOtp(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: forgotPasswordEmail,
            otp: otpCode,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("OTP verified successfully");
        setForgotPasswordStep(3);
        setOtpTimerActive(false); // Stop the timer once verified
      } else {
        toast.error(data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP. Please try again later.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Enhanced password validation
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      toast.error("Password must include at least one uppercase letter");
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      toast.error("Password must include at least one lowercase letter");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      toast.error("Password must include at least one number");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      toast.error("Password must include at least one special character");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setResettingPassword(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: forgotPasswordEmail,
            otp: forgotPasswordOtp.join(""),
            newPassword: newPassword,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Password reset successfully");
        resetForgotPasswordState();
        setForgotPasswordModalVisible(false);
      } else {
        toast.error(
          data.message || "Failed to reset password. Please try again."
        );
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password. Please try again later.");
    } finally {
      setResettingPassword(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Reset forgot password state
  const resetForgotPasswordState = () => {
    setForgotPasswordStep(1);
    setForgotPasswordEmail("");
    setForgotPasswordOtp(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
  };

  // Handle OTP digit change
  const handleOtpDigitChange = (index, value) => {
    const newOtp = [...forgotPasswordOtp];
    newOtp[index] = value;
    setForgotPasswordOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").replace(/\s/g, "");
    const digits = pastedText.slice(0, 6).split("");

    const newOtp = [...forgotPasswordOtp];
    digits.forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit;
    });

    setForgotPasswordOtp(newOtp);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex((d) => d === "");
    if (nextEmptyIndex >= 0 && nextEmptyIndex < 6) {
      setTimeout(() => {
        otpInputRefs[nextEmptyIndex].current?.focus();
      }, 50);
    } else {
      otpInputRefs[5].current?.focus();
    }
  };

  // Handle OTP keydown
  const handleOtpKeyDown = (e, index) => {
    if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs[index + 1].current?.focus();
    } else if (e.key === "Backspace" && !forgotPasswordOtp[index]) {
      if (index > 0) {
        otpInputRefs[index - 1].current?.focus();
      }
    }
  };

  const handleForgotPasswordClick = () => {
    console.log("Forgot password clicked");

    // Get email from login form if available
    if (formik.values.email && formik.values.email.trim() !== "") {
      setForgotPasswordEmail(formik.values.email);
    }

    setForgotPasswordModalVisible(true);
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .matches(
          /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail)\.com$/i,
          "Only gmail.com, yahoo.com, and hotmail.com emails are allowed"
        )
        .required("Email is required"),
      password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(
          /[^\w]/,
          "Password must contain at least one special character"
        ),
    }),
    onSubmit: (values) => {
      handleLogin(values);
    },
  });

  // Render OTP Input component
  const OtpInput = ({ index }) => (
    <input
      ref={otpInputRefs[index]}
      type="text"
      maxLength="1"
      value={forgotPasswordOtp[index]}
      onChange={(e) => handleOtpDigitChange(index, e.target.value.slice(-1))}
      onKeyDown={(e) => handleOtpKeyDown(e, index)}
      onClick={(e) => e.target.select()}
      className="w-12 h-14 mx-1 text-center text-2xl font-mono border border-gray-300 rounded focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
      autoComplete="off"
    />
  );

  // Render the forgot password modal content based on step
  // Updated renderForgotPasswordContent function with visual enhancements

  const renderForgotPasswordContent = () => {
    switch (forgotPasswordStep) {
      case 1:
        // If we already have a valid email from the login form
        if (
          formik.values.email &&
          !formik.errors.email &&
          formik.values.email.trim() !== ""
        ) {
          return (
            <div className="animate-fadeIn">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">
                Reset Password
              </h3>

              <div className="mb-6 p-5 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg shadow-sm">
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="mb-2 font-medium">
                      Send verification code to:
                    </p>
                    <p className="font-semibold text-lg">
                      {formik.values.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setForgotPasswordModalVisible(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={sendingOtp}
                  onClick={() => {
                    setForgotPasswordEmail(formik.values.email);
                    handleForgotPasswordEmailSubmit(new Event("submit"));
                  }}
                  className={`px-5 py-2 rounded-md text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    sendingOtp
                      ? "bg-gray-400"
                      : "bg-[#060606] hover:bg-gray-800 focus:ring-black"
                  }`}
                >
                  {sendingOtp ? (
                    <span className="flex items-center">
                      <Spin size="small" />
                      <span className="ml-2">Sending...</span>
                    </span>
                  ) : (
                    "Send Code"
                  )}
                </button>
              </div>

              <div className="mt-5 text-center border-t pt-4 border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordEmail("");
                    setForgotPasswordStep(0.5);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center justify-center mx-auto"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Use a different email
                </button>
              </div>
            </div>
          );
        }
      // Fall through to the manual email entry form if no valid email
      // eslint-disable-next-line
      case 0.5: // Special case for manual email entry
        return (
          <form
            onSubmit={handleForgotPasswordEmailSubmit}
            className="animate-fadeIn"
          >
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Reset Password
            </h3>
            <p className="mb-6 text-gray-600">
              Enter your email to receive a verification code
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="username"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
                required
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Only gmail.com, yahoo.com and hotmail.com emails are supported
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setForgotPasswordModalVisible(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingOtp}
                className={`px-5 py-2 rounded-md text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  sendingOtp
                    ? "bg-gray-400"
                    : "bg-[#060606] hover:bg-gray-800 focus:ring-black"
                }`}
              >
                {sendingOtp ? (
                  <span className="flex items-center">
                    <Spin size="small" />
                    <span className="ml-2">Sending...</span>
                  </span>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </form>
        );

      case 2: // OTP Verification - Enhanced
        return (
          <form onSubmit={handleVerifyOtp} className="animate-fadeIn">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Verification
            </h3>
            <p className="mb-2 text-gray-600">Enter the 6-digit code sent to</p>
            <p className="mb-5 font-medium text-gray-800">
              {forgotPasswordEmail}
            </p>

            <div className="my-8" onPaste={handleOtpPaste}>
              <div className="flex justify-center mb-4 space-x-2">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="w-12 h-14 relative">
                      <input
                        ref={otpInputRefs[i]}
                        type="text"
                        maxLength="1"
                        value={forgotPasswordOtp[i]}
                        onChange={(e) =>
                          handleOtpDigitChange(i, e.target.value.slice(-1))
                        }
                        onKeyDown={(e) => handleOtpKeyDown(e, i)}
                        onClick={(e) => e.target.select()}
                        className={`w-full h-full text-center text-xl font-bold border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-150 ${
                          forgotPasswordOtp[i]
                            ? "border-gray-600 bg-gray-50"
                            : "border-gray-300"
                        }`}
                        autoComplete="off"
                      />
                      {i < 5 && (
                        <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 text-gray-300 pointer-events-none">
                          {forgotPasswordOtp[i] &&
                            !forgotPasswordOtp[i + 1] && (
                              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              <p className="text-xs text-gray-500 text-center flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                You can paste the complete code
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setForgotPasswordStep(1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={
                  verifyingOtp || forgotPasswordOtp.some((d) => d === "")
                }
                className={`px-5 py-2 rounded-md text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  verifyingOtp || forgotPasswordOtp.some((d) => d === "")
                    ? "bg-gray-400"
                    : "bg-[#060606] hover:bg-gray-800 focus:ring-black"
                }`}
              >
                {verifyingOtp ? (
                  <span className="flex items-center">
                    <Spin size="small" />
                    <span className="ml-2">Verifying...</span>
                  </span>
                ) : (
                  "Verify Code"
                )}
              </button>
            </div>

            <div className="mt-5 text-center border-t pt-4 border-gray-100">
              <p className="text-gray-600 text-sm mb-2">
                Didn't receive a code?
              </p>
              <button
                type="button"
                onClick={handleForgotPasswordEmailSubmit}
                disabled={sendingOtp}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center mx-auto"
              >
                {sendingOtp ? (
                  <span className="flex items-center">
                    <Spin size="small" />
                    <span className="ml-2">Sending...</span>
                  </span>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Resend Code
                  </>
                )}
              </button>
            </div>
          </form>
        );

      case 3: // Reset Password - Enhanced
        return (
          <form onSubmit={handleResetPassword} className="animate-fadeIn">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Create New Password
            </h3>
            <p className="mb-6 text-gray-600">
              Your identity has been verified! Set a new password for your
              account.
            </p>

            <div className="mb-5">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 border ${
                    newPassword.length > 0 && newPassword.length < 6
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-black"
                  } rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-200`}
                  required
                  minLength={6}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {newPassword.length > 0 &&
                    (newPassword.length >= 6 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Password must be at least 6 characters long
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 border ${
                    confirmPassword && confirmPassword !== newPassword
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-black"
                  } rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-200`}
                  required
                />
                {confirmPassword && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {confirmPassword === newPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                )}
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setForgotPasswordStep(2)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={
                  resettingPassword ||
                  newPassword.length < 6 ||
                  newPassword !== confirmPassword
                }
                className={`px-5 py-2 rounded-md text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  resettingPassword ||
                  newPassword.length < 6 ||
                  newPassword !== confirmPassword
                    ? "bg-gray-400"
                    : "bg-[#060606] hover:bg-gray-800 focus:ring-black"
                }`}
              >
                {resettingPassword ? (
                  <span className="flex items-center">
                    <Spin size="small" />
                    <span className="ml-2">Updating...</span>
                  </span>
                ) : (
                  "Set New Password"
                )}
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen flex items-start">
      <div className="relative w-1/2 h-full flex flex-col">
        <div className="absolute top-[20%] left-[10%] flex flex-col">
          <h1 className="text-4xl text-white font-bold my-4">
            Turn your ideas into reality
          </h1>
          <p className="text-xl text-white font-normal">
            Start your free and get attractive offers from the community
          </p>
        </div>
        <img
          src={COVER_IMAGE}
          alt="gym-image"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-1/2 h-full bg-[#f5f5f5] flex flex-col p-20 justify-between">
        <h1 className="text-xl text-[#060606] font-semibold">Ox-Fit</h1>

        <div className="w-full flex flex-col max-w-[550px]">
          <div className="w-full flex flex-col mb-2">
            <h3 className="text-3xl font-semibold mb-2">Login</h3>
            <p className="text-base mb-2">
              Welcome Back! Please enter your details
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="w-full">
            <div className="w-full flex flex-col">
              <input
                name="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                type="email"
                placeholder="Email"
                autoComplete="username"
                className="w-full text-black py-4 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
              {formik.errors.email && formik.touched.email ? (
                <p className="text-red-500 text-sm">{formik.errors.email}</p>
              ) : null}
              <div className="relative w-full">
                <input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  id="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full text-black py-4 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                  tabIndex="-1" // Prevents tab focus on the button
                >
                  {passwordVisible ? (
                    // Eye-off icon (password visible)
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    // Eye icon (password hidden)
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {formik.errors.password && formik.touched.password ? (
              <p className="text-red-500 text-sm">{formik.errors.password}</p>
            ) : null}

            <div className="w-full flex items-center justify-between mt-2">
              <div className="w-full flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 mr-2"
                />
                <p className="text-sm">Remember me for 30 days</p>
              </div>

              <p
                className="text-sm font-medium text-blue-600 whitespace-nowrap cursor-pointer underline underline-offset-2 hover:text-blue-800"
                onClick={handleForgotPasswordClick} // This is the updated line
              >
                Forgot Password?
              </p>
            </div>

            <div className="w-full flex flex-col my-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white my-2 font-semibold ${
                  isSubmitting
                    ? "bg-gray-500"
                    : "bg-[#060606] hover:bg-gray-800"
                } rounded-md p-4 text-center flex items-center justify-center transition`}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
              <button
                type="button"
                className="w-full text-[#060606] my-2 font-semibold border-2 bg-white border-black rounded-md p-4 text-center flex items-center justify-center hover:bg-gray-100 transition"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </div>
          </form>
        </div>

        <div className="w-full flex items-center justify-center">
          <p className="text-sm font-normal text-[#060606]">
            Don't have an account?{" "}
            <span
              className="font-semibold underline underline-offset-0 cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
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
        {renderForgotPasswordContent()}
      </Modal>
    </div>
  );
};

export default Login;
