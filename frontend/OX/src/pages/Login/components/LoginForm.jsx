import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { EMAIL_PATTERN, PASSWORD_PATTERN } from "../../../utils/validation";

const LoginForm = ({
  onSubmit,
  isSubmitting,
  rememberMe,
  setRememberMe,
  onForgotPassword,
}) => {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .matches(
          EMAIL_PATTERN,
          "Only gmail.com, yahoo.com, and hotmail.com emails are allowed"
        )
        .required("Email is required"),
      password: Yup.string()
        .required("Password is required")
        .matches(PASSWORD_PATTERN, "Password must meet all requirements"),
    }),
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <>
      <div className="w-full flex flex-col mb-6">
        <h3 className="text-3xl font-bold mb-3 text-gray-800">Login</h3>
        <p className="text-base text-gray-600 mb-2">
          Welcome Back! Please enter your details
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="w-full">
        <div className="w-full flex flex-col">
          {/* Email Input */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              name="email"
              id="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              type="email"
              placeholder="Enter your email"
              autoComplete="username"
              className={`w-full px-4 py-3 rounded-lg border ${
                formik.errors.email && formik.touched.email
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors`}
            />
            {formik.errors.email && formik.touched.email ? (
              <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
            ) : null}
          </div>

          {/* Password Input with toggle visibility */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative w-full">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                id="password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                placeholder="Enter your password"
                autoComplete="current-password"
                className={`w-full px-4 py-3 rounded-lg border ${
                  formik.errors.password && formik.touched.password
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors pr-10`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
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
            {/* Password validation error */}
            {formik.errors.password && formik.touched.password ? (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.password}
              </p>
            ) : null}
          </div>

          {/* Remember me and Forgot password row */}
          <div className="w-full flex flex-wrap items-center justify-between mt-2 mb-6">
            <div className="flex items-center mb-2 sm:mb-0">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 mr-2 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-600">
                Remember me for 30 days
              </label>
            </div>

            <button
              type="button"
              className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
              onClick={() => onForgotPassword(formik.values.email)}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit buttons */}
          <div className="w-full flex flex-col gap-3">
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
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
            <button
              type="button"
              className="w-full text-gray-800 font-semibold border-2 border-gray-300 rounded-lg p-4 text-center flex items-center justify-center hover:bg-gray-50 transition-all duration-300"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default LoginForm;
