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
      <div className="w-full flex flex-col mb-2">
        <h3 className="text-3xl font-semibold mb-2">Login</h3>
        <p className="text-base mb-2">
          Welcome Back! Please enter your details
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="w-full">
        <div className="w-full flex flex-col">
          {/* Email Input */}
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

          {/* Password Input with toggle visibility */}
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
        </div>

        {/* Password validation error */}
        {formik.errors.password && formik.touched.password ? (
          <p className="text-red-500 text-sm">{formik.errors.password}</p>
        ) : null}

        {/* Remember me and Forgot password row */}
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
            onClick={() => onForgotPassword(formik.values.email)}
          >
            Forgot Password?
          </p>
        </div>

        {/* Submit buttons */}
        <div className="w-full flex flex-col my-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white my-2 font-semibold ${
              isSubmitting ? "bg-gray-500" : "bg-[#060606] hover:bg-gray-800"
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
    </>
  );
};

export default LoginForm;
