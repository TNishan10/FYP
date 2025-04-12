import React, { useEffect } from "react";
import { Spin } from "antd";
import { toast } from "react-toastify";

const OTPVerificationStep = ({
  email,
  otp,
  setOtp,
  otpRefs,
  verifyingOtp,
  otpTimerActive,
  otpExpiryTime,
  onVerify,
  onResend,
  onBack,
}) => {
  // Timer functionality
  useEffect(() => {
    let interval = null;
    if (otpTimerActive && otpExpiryTime > 0) {
      interval = setInterval(() => {
        setOtpExpiryTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (otpExpiryTime <= 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpTimerActive, otpExpiryTime]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^[a-zA-Z0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input if value is entered
    if (value !== "" && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  // Handle key down events (backspace to go back, etc)
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs[index - 1].current.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs[index - 1].current.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  // Handle pasting OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // Check if pasted content is 6 digits
    if (/^[a-zA-Z0-9]{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("").slice(0, 6);
      setOtp(newOtp);
      otpRefs[5].current.focus();
    } else {
      toast.error("Please paste a 6-character verification code");
    }
  };

  return (
    <form onSubmit={onVerify} className="animate-fadeIn">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">
        Verify Your Email
      </h3>
      <p className="mb-4 text-gray-600">
        We've sent a verification code to <strong>{email}</strong>
      </p>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-4 text-gray-700">
          Enter 6-digit verification code
        </label>

        <div className="flex justify-center space-x-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              ref={otpRefs[index]}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : null}
              maxLength={1}
              className="w-12 h-14 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
            />
          ))}
        </div>

        {otpTimerActive && (
          <div className="mt-4 text-center">
            <p
              className={`text-sm ${
                otpExpiryTime < 30 ? "text-red-500" : "text-gray-600"
              }`}
            >
              Code expires in {formatTime(otpExpiryTime)}
            </p>
          </div>
        )}

        {!otpTimerActive && (
          <div className="mt-4 text-center">
            <p className="text-sm text-red-500">
              Code expired. Please request a new one.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-3">
        <button
          type="submit"
          disabled={
            verifyingOtp || otp.join("").length !== 6 || !otpTimerActive
          }
          className={`px-5 py-2 rounded-md text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            verifyingOtp || otp.join("").length !== 6 || !otpTimerActive
              ? "bg-gray-400"
              : "bg-[#060606] hover:bg-gray-800 focus:ring-black"
          }`}
        >
          {verifyingOtp ? (
            <span className="flex items-center justify-center">
              <Spin size="small" />
              <span className="ml-2">Verifying...</span>
            </span>
          ) : (
            "Verify"
          )}
        </button>

        <div className="flex justify-between w-full">
          <button
            type="button"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 text-sm focus:outline-none"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={onResend}
            disabled={otpTimerActive}
            className={`text-sm focus:outline-none ${
              otpTimerActive
                ? "text-gray-400"
                : "text-blue-600 hover:text-blue-800"
            }`}
          >
            Resend Code
          </button>
        </div>
      </div>
    </form>
  );
};

export default OTPVerificationStep;
