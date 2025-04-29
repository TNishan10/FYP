import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { validateEmail, validatePassword } from "../../../utils/validation";

const RegisterForm = ({ onSubmit, isSubmitting }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Validation errors
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Track field focus state
  const [focusedField, setFocusedField] = useState(null);

  // Check if all password criteria are met
  const allPasswordCriteriaMet =
    formData.password.length >= 8 &&
    /[A-Z]/.test(formData.password) &&
    /[a-z]/.test(formData.password) &&
    /\d/.test(formData.password) &&
    /[@$!%*?&#]/.test(formData.password);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  // Validate a specific field
  const validateField = (name, value) => {
    // Same validation logic as before
    if (!value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    if (name === "email") {
      return validateEmail(value);
    }

    if (name === "password") {
      return validatePassword(value);
    }

    if (name === "name" && !/^[A-Za-z\s]{2,50}$/.test(value)) {
      return "Name should contain only letters and spaces";
    }

    return "";
  };

  // Validate on blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error,
    });
    setFocusedField(null);
  };

  // Handle focus
  const handleFocus = (e) => {
    setFocusedField(e.target.name);
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
    };

    setErrors(newErrors);

    // Form is valid if no error messages exist
    return !Object.values(newErrors).some((error) => error);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    onSubmit(formData);
  };

  // Determine if we should show password criteria
  const shouldShowPasswordCriteria =
    focusedField === "password" ||
    (formData.password.length > 0 && !allPasswordCriteriaMet);

  return (
    <>
      <div className="w-full flex flex-col mb-6">
        <h3 className="text-3xl font-bold mb-3 text-gray-800">
          Create Account
        </h3>
        <p className="text-base text-gray-600">
          Welcome! Please enter your details to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="w-full flex flex-col">
          {/* Name Field */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Create a strong password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.password ? "border-red-500 bg-red-50" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}

            {/* Password criteria - only shown when needed */}
            {shouldShowPasswordCriteria && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200 transition-all duration-300">
                <p className="text-xs font-medium text-gray-600 mb-1">
                  Password must have:
                </p>
                <ul className="text-xs text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1">
                  <li className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                        formData.password.length >= 8
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      {formData.password.length >= 8 && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      )}
                    </div>
                    At least 8 characters
                  </li>
                  <li className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                        /[A-Z]/.test(formData.password)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      {/[A-Z]/.test(formData.password) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      )}
                    </div>
                    One uppercase letter
                  </li>
                  <li className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                        /[a-z]/.test(formData.password)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      {/[a-z]/.test(formData.password) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      )}
                    </div>
                    One lowercase letter
                  </li>
                  <li className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                        /\d/.test(formData.password)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      {/\d/.test(formData.password) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      )}
                    </div>
                    One number
                  </li>
                  <li className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                        /[@$!%*?&#]/.test(formData.password)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      {/[@$!%*?&#]/.test(formData.password) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      )}
                    </div>
                    One special character (@$!%*?&#)
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex flex-col my-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white font-semibold rounded-lg p-4 text-center flex items-center justify-center transition-all duration-300 ${
              isSubmitting
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            }`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating your account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </div>
      </form>

      <div className="w-full flex items-center justify-center mt-6">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <span
            className="font-medium text-orange-500 hover:text-orange-600 cursor-pointer transition-colors"
            onClick={() => navigate("/login")}
          >
            Log in
          </span>
        </p>
      </div>
    </>
  );
};

export default RegisterForm;
