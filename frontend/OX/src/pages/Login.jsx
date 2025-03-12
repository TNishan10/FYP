import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import COVER_IMAGE from "../assets/login.jpg";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const colors = {
  primary: "060606",
  background: "f5f5f5",
  disbaled: "D9D9D9",
};

const Login = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (values) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      console.log("Login Data:", data);

      if (data?.success === true) {
        // Check if email is verified
        if (data.data.user.isVerified === false) {
          // Store the email in localStorage for the verification page to use
          localStorage.setItem("pendingVerificationEmail", values.email);

          // Show toast notification
          toast.info("Your email needs to be verified before logging in");

          // Navigate to verification page
          navigate("/verify-email");
          return;
        }

        // Rest of your success handling code...
        localStorage.setItem("userEmail", data.data.user.email);
        localStorage.setItem("isLoggedIn", true);
        // Store JWT token in session storage
        sessionStorage.setItem("token", data.data.token);
        toast.success("Login Success");

        // Changed this line to navigate to UserInfo page
        navigate("/user-info");
      } else {
        toast.error(data.message || "Login Failed");
      }
    } catch (error) {
      console.error("Backend Error:", error);
      toast.error("An error occurred during login");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendVerification = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/auth/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: verificationEmail }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert("Verification email sent! Please check your inbox.");
      } else {
        alert(data.message || "Failed to send verification email");
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      alert("Failed to send verification email");
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .matches(
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          "Invalid email format"
        )
        .required("Email is required"),
      password: Yup.string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters"),
    }),
    onSubmit: (values) => {
      handleLogin(values);
    },
  });

  return (
    <div className="w-full h-screen flex items-start">
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
        <h1 className="text-xl text-[#060606] font-semibold">Ox-Fit</h1>

        <div className="w-full flex flex-col max-w-[550px]">
          <div className="w-full flex flex-col mb-2">
            <h3 className="text-3xl font-semibold mb-2">Login</h3>
            <p className="text-base mb-2">
              Welcome Back! Please enter your details
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="w-full">
            <div className="w-full flex flex-col">
              <input
                name="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                type="email"
                placeholder="Email"
                className="w-full text-black py-4 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
              {formik.errors.email && formik.touched.email ? (
                <p className="text-red-500 text-sm">{formik.errors.email}</p>
              ) : null}
              <input
                type="password"
                name="password"
                id="password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                placeholder="Password"
                className="w-full text-black py-4 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
            </div>
            {formik.errors.password && formik.touched.password ? (
              <p className="text-red-500 text-sm">{formik.errors.password}</p>
            ) : null}

            <div className="w-full flex items-center justify-between mt-2">
              <div className="w-full flex items-center">
                <input type="checkbox" className="w-4 h-4 mr-2" />
                <p className="text-sm">Remember me for 30 days</p>
              </div>

              <p className="text-sm font-medium whitespace-nowrap cursor-pointer underline underline-offset-2">
                Forgot Password?
              </p>
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
        </div>

        <div className="w-full flex items-center justify-center">
          <p className="text-sm font-normal text-[#060606]">
            Don't have an account?{" "}
            <span
              className="font-semibold underline underline-offset-0 cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
