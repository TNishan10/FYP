import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import EmailStep from "./EmailStep";
import OTPVerificationStep from "./OTPVerificationStep";
import SetNewPasswordStep from "./SetNewPasswordStep";
import { PASSWORD_PATTERN } from "../../../../utils/validation";

const ForgotPasswordModal = ({ email, setEmail, step, setStep, onClose }) => {
  // State for OTP handling
  const [otpTimerActive, setOtpTimerActive] = useState(false);
  const [otpExpiryTime, setOtpExpiryTime] = useState(300); // 5 minutes
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  // State for password reset
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading states
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  // Create refs for OTP inputs
  const otpInputRefs = Array(6)
    .fill(0)
    .map(() => React.createRef());

  // Handle send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setSendingOtp(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Verification code sent to your email");
        setStep(2); // Move to OTP verification step

        // Set timer
        setOtpExpiryTime(300); // 5 minutes
        setOtpTimerActive(true);

        // Focus first OTP input
        setTimeout(() => {
          if (otpInputRefs[0]?.current) {
            otpInputRefs[0].current.focus();
          }
        }, 300);
      } else {
        toast.error(data.message || "Failed to send verification code");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const otpCode = forgotPasswordOtp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setVerifyingOtp(true);
    try {
      // For reset password flow, we just verify locally
      // and proceed to the next step
      setStep(3); // Move to set new password step
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Handle reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!PASSWORD_PATTERN.test(newPassword)) {
      toast.error("Password does not meet complexity requirements");
      return;
    }

    setResettingPassword(true);
    try {
      const otpCode = forgotPasswordOtp.join("").toUpperCase();
      // Log what we're sending to the API for debugging
      console.log("Reset password payload:", {
        email,
        otp: otpCode,
        password: newPassword,
      });

      const response = await fetch(
        "http://localhost:8000/api/v1/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            otp: otpCode,
            password: newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Reset password error:", errorData);
        toast.error(errorData.message || "Failed to reset password");
        return;
      }

      const data = await response.json();
      console.log("Reset password response:", data);

      toast.success(
        "Password reset successfully! You can now login with your new password."
      );
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setResettingPassword(false);
    }
  };

  // Render current step
  switch (step) {
    case 1:
      return (
        <EmailStep
          email={email}
          setEmail={setEmail}
          sendingOtp={sendingOtp}
          onSubmit={handleSendOtp}
        />
      );
    case 2:
      return (
        <OTPVerificationStep
          email={email}
          otp={forgotPasswordOtp}
          setOtp={setForgotPasswordOtp}
          otpRefs={otpInputRefs}
          verifyingOtp={verifyingOtp}
          otpTimerActive={otpTimerActive}
          otpExpiryTime={otpExpiryTime}
          onVerify={handleVerifyOtp}
          onResend={handleSendOtp}
          onBack={() => setStep(1)}
        />
      );
    case 3:
      return (
        <SetNewPasswordStep
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          resettingPassword={resettingPassword}
          onReset={handleResetPassword}
          onBack={() => setStep(2)}
        />
      );
    default:
      return null;
  }
};

export default ForgotPasswordModal;
