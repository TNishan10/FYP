import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoadingSpinner = () => (
  <div className="flex justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);

// Improved code digit input component with better focus management
const CodeDigitInput = ({ index, value, onChange, inputRefs }) => {
  const handleKeyDown = (e) => {
    // Navigate between inputs using arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs[index - 1].current.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs[index + 1].current.focus();
    }
    // Handle backspace to go to previous input
    else if (e.key === "Backspace" && !value) {
      if (index > 0) {
        inputRefs[index - 1].current.focus();
      }
    }
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    // Only take the last character if multiple were somehow entered
    const lastChar = inputValue
      .slice(-1)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    if (lastChar) {
      // Update the value immediately
      onChange(index, lastChar);

      // Move focus to next input with a slight delay to ensure state is updated
      if (index < 5) {
        setTimeout(() => {
          inputRefs[index + 1].current?.focus();
        }, 10);
      }
    } else if (inputValue === "") {
      // If the input was cleared
      onChange(index, "");
    }
  };

  // Handle input click to select all text
  const handleClick = (e) => {
    e.target.select();
  };

  return (
    <input
      ref={inputRefs[index]}
      type="text"
      maxLength="1"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      className="w-12 h-14 mx-1 text-center text-2xl font-mono border border-gray-300 rounded focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
      autoComplete="off"
      inputMode="text"
    />
  );
};

const VerifyEmail = () => {
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [resendEmail, setResendEmail] = useState("");
  const [resendInProgress, setResendInProgress] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // For code verification - using array of digits instead of single string
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""]);
  const [verifyingCode, setVerifyingCode] = useState(false);

  // Create refs for each input field
  const inputRefs = Array(6)
    .fill(0)
    .map(() => useRef(null));

  // Handle pasting verification code
  const handleCodePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").replace(/\s/g, "");
    const digits = pastedText
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6)
      .split("");

    // Fill in available digits
    const newDigits = [...codeDigits];
    digits.forEach((digit, index) => {
      if (index < 6) newDigits[index] = digit;
    });

    setCodeDigits(newDigits);

    // Focus the next empty input or the last one if all filled
    const nextEmptyIndex = newDigits.findIndex((d) => d === "");
    if (nextEmptyIndex >= 0) {
      setTimeout(() => {
        inputRefs[nextEmptyIndex].current?.focus();
      }, 50);
    } else if (newDigits.every((d) => d !== "")) {
      setTimeout(() => {
        inputRefs[5].current?.focus();
      }, 50);
    }
  };

  // Handle code digit change
  const handleCodeDigitChange = (index, value) => {
    const newDigits = [...codeDigits];
    newDigits[index] = value;
    setCodeDigits(newDigits);
  };

  // Initialize with email from localStorage if available
  useEffect(() => {
    const savedEmail =
      sessionStorage.getItem("pendingVerificationEmail") ||
      localStorage.getItem("pendingVerificationEmail");
    if (savedEmail) {
      setResendEmail(savedEmail);
    }

    // Check for token in URL
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    if (token) {
      verifyToken(token);
    } else {
      // Auto-focus first input field when component loads
      setTimeout(() => {
        if (inputRefs[0].current) {
          inputRefs[0].current.focus();
        }
      }, 300);
    }
  }, [location.search]);

  // Verify token from URL
  const verifyToken = async (token) => {
    setVerifying(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/auth/verify-email",
        { token }
      );
      setVerificationStatus(response.data);

      if (response.data.success) {
        toast.success("Email verified successfully!");
        localStorage.removeItem("pendingVerificationEmail");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus({
        success: false,
        message:
          error.response?.data?.message ||
          "Error verifying email. Please try again.",
      });
      toast.error(
        "Verification failed. Please try again or use the code sent to your email."
      );
    } finally {
      setVerifying(false);
    }
  };

  // Resend verification email
  const handleResendVerification = async (e) => {
    e.preventDefault();
    if (!resendEmail || !resendEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setResendInProgress(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/auth/resend-verification",
        { email: resendEmail }
      );

      toast.success("Verification email sent! Please check your inbox.");

      // Clear current digits and focus first input
      setCodeDigits(["", "", "", "", "", ""]);
      setTimeout(() => {
        if (inputRefs[0].current) {
          inputRefs[0].current.focus();
        }
      }, 300);
    } catch (error) {
      console.error("Error resending verification:", error);
      toast.error(
        error.response?.data?.message || "Failed to send verification email"
      );
    } finally {
      setResendInProgress(false);
    }
  };

  // Verify using code
  const handleVerifyCode = async (e) => {
    e.preventDefault();

    const verificationCode = codeDigits.join("");

    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter the complete 6-character verification code");
      return;
    }

    if (!resendEmail) {
      toast.error("Email address is required");
      return;
    }

    setVerifyingCode(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/auth/verify-code",
        {
          email: resendEmail,
          code: verificationCode,
        }
      );

      setVerificationStatus({
        success: true,
        message: "Email verified successfully!",
      });

      toast.success("Email verified successfully!");
      localStorage.removeItem("pendingVerificationEmail");

      // Redirect after showing success message
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Code verification error:", error);
      toast.error(error.response?.data?.message || "Invalid verification code");

      setVerificationStatus({
        ...verificationStatus,
        success: false,
        message: error.response?.data?.message || "Invalid verification code",
      });
    } finally {
      setVerifyingCode(false);
    }
  };

  // Code verification form component
  const CodeVerificationForm = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Verify Your Email</h2>

      <div className="mb-6">
        <p className="mb-2">We've sent a verification code to:</p>
        <p className="font-medium text-lg">{resendEmail}</p>
      </div>

      <form onSubmit={handleVerifyCode} className="flex flex-col items-center">
        <div className="mb-6 w-full">
          <label htmlFor="code" className="block text-left mb-3 font-medium">
            Enter 6-character verification code
          </label>

          <div className="flex justify-center mb-3" onPaste={handleCodePaste}>
            {codeDigits.map((digit, index) => (
              <CodeDigitInput
                key={index}
                index={index}
                value={digit}
                onChange={handleCodeDigitChange}
                inputRefs={inputRefs}
              />
            ))}
          </div>

          {verificationStatus?.success === false && (
            <p className="mt-2 text-sm text-red-500">
              {verificationStatus?.message}
            </p>
          )}

          <p className="text-xs text-gray-500 text-center">
            You can also paste the complete code
          </p>
        </div>

        <button
          type="submit"
          disabled={verifyingCode || codeDigits.some((d) => d === "")}
          className={`px-6 py-3 ${
            verifyingCode || codeDigits.some((d) => d === "")
              ? "bg-gray-400"
              : "bg-[#060606] hover:bg-gray-700"
          } text-white rounded-md transition w-full mb-4`}
        >
          {verifyingCode ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t">
        <p className="mb-4">Didn't receive the code?</p>
        <button
          onClick={handleResendVerification}
          disabled={resendInProgress}
          className="text-[#060606] font-semibold hover:text-gray-600"
        >
          {resendInProgress ? "Sending..." : "Resend verification code"}
        </button>
      </div>

      <div className="mt-8">
        <button
          onClick={() => navigate("/login")}
          className="text-[#060606] underline"
        >
          Return to Login
        </button>
      </div>
    </div>
  );

  // Success component
  const VerificationSuccess = () => (
    <div>
      <div className="mb-6 flex justify-center">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-green-600">
        Email Verified!
      </h2>
      <p className="mb-6">
        {verificationStatus?.message ||
          "Your email has been verified successfully."}
      </p>
      <button
        onClick={() => navigate("/login")}
        className="px-6 py-3 bg-[#060606] text-white rounded-md hover:bg-gray-800 transition"
      >
        Go to Login
      </button>
    </div>
  );

  // Render the appropriate content based on state
  const renderContent = () => {
    if (verifying) {
      return (
        <div>
          <h2 className="text-2xl font-bold mb-4">Verifying your email...</h2>
          <LoadingSpinner />
          <p className="mt-4">
            Please wait while we verify your email address.
          </p>
        </div>
      );
    }

    if (verificationStatus?.success) {
      return <VerificationSuccess />;
    }

    // Default: Show code verification form
    return <CodeVerificationForm />;
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#f5f5f5]">
      <ToastContainer position="top-center" />
      <div className="w-[500px] bg-white p-8 rounded-lg shadow-md text-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default VerifyEmail;
