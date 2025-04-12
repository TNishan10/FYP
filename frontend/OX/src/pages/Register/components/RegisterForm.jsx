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

  return (
    <>
      <div className="w-full flex flex-col mb-2">
        <h3 className="text-3xl font-semibold mb-2">Register</h3>
        <p className="text-base mb-2">
          Welcome! Please enter your details to register.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="w-full flex flex-col">
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full text-black py-4 my-2 bg-transparent border-b ${
              errors.name ? "border-red-500" : "border-black"
            } outline-none focus:outline-none`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}

          <input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full text-black py-4 my-2 bg-transparent border-b ${
              errors.email ? "border-red-500" : "border-black"
            } outline-none focus:outline-none`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}

          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full text-black py-4 my-2 bg-transparent border-b ${
              errors.password ? "border-red-500" : "border-black"
            } outline-none focus:outline-none`}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}

          {/* Password criteria */}
          <div className="mt-2 mb-4">
            <p className="text-xs text-gray-500">Password must have:</p>
            <ul className="text-xs text-gray-500 list-disc pl-5 mt-1">
              <li
                className={
                  formData.password.length >= 8 ? "text-green-500" : ""
                }
              >
                At least 8 characters
              </li>
              <li
                className={
                  /[A-Z]/.test(formData.password) ? "text-green-500" : ""
                }
              >
                At least one uppercase letter
              </li>
              <li
                className={
                  /[a-z]/.test(formData.password) ? "text-green-500" : ""
                }
              >
                At least one lowercase letter
              </li>
              <li
                className={/\d/.test(formData.password) ? "text-green-500" : ""}
              >
                At least one number
              </li>
              <li
                className={
                  /[@$!%*?&#]/.test(formData.password) ? "text-green-500" : ""
                }
              >
                At least one special character (@$!%*?&#)
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full flex flex-col my-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white my-2 font-semibold ${
              isSubmitting ? "bg-gray-500" : "bg-[#060606] hover:bg-gray-800"
            } rounded-md p-4 text-center flex items-center justify-center transition`}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </div>
      </form>

      <div className="w-full flex items-center justify-center">
        <p className="text-sm font-normal text-[#060606]">
          Already have an account?{" "}
          <span
            className="font-semibold underline underline-offset-2 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </>
  );
};

export default RegisterForm;
