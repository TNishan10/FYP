import React, { useState } from "react";
import COVER_IMAGE from "../assets/login.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Validation errors
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Regex patterns
  const patterns = {
    name: /^[A-Za-z\s]{2,50}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#]{6,}$/,
  };

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

    if (!patterns[name].test(value)) {
      switch (name) {
        case "name":
          return "Name should contain only letters and spaces";
        case "email":
          return "Please enter a valid email address";
        case "password":
          return "Password must be at least 6 characters with at least one uppercase letter, one lowercase letter, and one number";
        default:
          return "";
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        "http://localhost:8000/api/v1/auth/register",
        formData
      );
      console.log("Backend Response:", response.data);
      setMessage(response.data.message);
      setError("");

      // Show success toast
      toast.success(
        <div>
          <p>
            <strong>Registration successful!</strong>
          </p>
          <p>Check your email for a verification code.</p>
        </div>,
        { autoClose: 3000 }
      );

      // Store email in localStorage for verification page
      localStorage.setItem("pendingVerificationEmail", formData.email);

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
      });

      // Redirect immediately to verification page
      navigate("/verify-email");
    } catch (err) {
      console.error("Backend Error:", err.response?.data);
      setError(
        err.response?.data?.message || "An error occurred during registration."
      );
      setMessage("");
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-start">
      <ToastContainer />
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
        <h1 className="text-xl text-[#060606] font-semibold">OX-Fit</h1>

        <div className="w-full flex flex-col max-w-[550px]">
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
                {isSubmitting ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
          {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

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
      </div>
    </div>
  );
};

export default Register;
