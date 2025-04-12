import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import RegisterLayout from "./components/RegisterLayout";
import RegisterForm from "./components/RegisterForm";


const Register = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (formData) => {
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

      // Store email in sessionStorage for verification page
      sessionStorage.setItem("pendingVerificationEmail", formData.email);

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
    <RegisterLayout>
      <RegisterForm onSubmit={handleRegister} isSubmitting={isSubmitting} />

      {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </RegisterLayout>
  );
};

export default Register;
