import React from "react";
import { useNavigate } from "react-router-dom";
import COVER_IMAGE from "../../../assets/login.jpg";

const LoginLayout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen flex items-start">
      {/* Left side - Image */}
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

      {/* Right side - Form */}
      <div className="w-1/2 h-full bg-[#f5f5f5] flex flex-col p-20 justify-between">
        <h1 className="text-xl text-[#060606] font-semibold">Ox-Fit</h1>

        {/* Main content area - will render LoginForm */}
        <div className="w-full flex flex-col max-w-[550px]">{children}</div>

        {/* Footer registration link */}
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

export default LoginLayout;
