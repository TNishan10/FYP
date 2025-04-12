import React, { useState } from "react";
import { Spin } from "antd";

const SetNewPasswordStep = ({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  resettingPassword,
  onReset,
  onBack,
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Password strength checker
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthClass =
    [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-blue-500",
      "bg-green-500",
    ][passwordStrength - 1] || "bg-gray-300";

  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword !== "";

  return (
    <form onSubmit={onReset} className="animate-fadeIn">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">
        Create New Password
      </h3>
      <p className="mb-6 text-gray-600">
        Your password must be different from previous used passwords
      </p>

      <div className="space-y-4 mb-6">
        {/* New password input */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            New Password
          </label>
          <div className="relative">
            <input
              type={passwordVisible ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
              tabIndex="-1"
            >
              {passwordVisible ? (
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

          {/* Password strength indicator */}
          {newPassword && (
            <div className="mt-2">
              <div className="flex w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`transition-all duration-500 ${strengthClass}`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs mt-1 text-gray-600">
                {passwordStrength < 3
                  ? "Weak password"
                  : passwordStrength < 5
                  ? "Moderate password"
                  : "Strong password"}
              </p>
            </div>
          )}

          {/* Password requirements */}
          <div className="mt-2 space-y-1">
            <p
              className={`text-xs ${
                newPassword.length >= 8 ? "text-green-600" : "text-gray-500"
              }`}
            >
              • At least 8 characters
            </p>
            <p
              className={`text-xs ${
                /[A-Z]/.test(newPassword) ? "text-green-600" : "text-gray-500"
              }`}
            >
              • At least one uppercase letter
            </p>
            <p
              className={`text-xs ${
                /[a-z]/.test(newPassword) ? "text-green-600" : "text-gray-500"
              }`}
            >
              • At least one lowercase letter
            </p>
            <p
              className={`text-xs ${
                /[0-9]/.test(newPassword) ? "text-green-600" : "text-gray-500"
              }`}
            >
              • At least one number
            </p>
            <p
              className={`text-xs ${
                /[^A-Za-z0-9]/.test(newPassword)
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
            >
              • At least one special character
            </p>
          </div>
        </div>

        {/* Confirm password input */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200 ${
                confirmPassword && !passwordsMatch
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
              tabIndex="-1"
            >
              {confirmPasswordVisible ? (
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

          {confirmPassword && !passwordsMatch && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-3">
        <button
          type="submit"
          disabled={
            resettingPassword ||
            !passwordsMatch ||
            passwordStrength < 3 ||
            !newPassword ||
            !confirmPassword
          }
          className={`px-5 py-2 rounded-md text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            resettingPassword ||
            !passwordsMatch ||
            passwordStrength < 3 ||
            !newPassword ||
            !confirmPassword
              ? "bg-gray-400"
              : "bg-[#060606] hover:bg-gray-800 focus:ring-black"
          }`}
        >
          {resettingPassword ? (
            <span className="flex items-center justify-center">
              <Spin size="small" />
              <span className="ml-2">Updating Password...</span>
            </span>
          ) : (
            "Reset Password"
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 text-sm focus:outline-none"
        >
          ← Back to Verification
        </button>
      </div>
    </form>
  );
};

export default SetNewPasswordStep;
