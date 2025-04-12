import React from "react";
import COVER_IMAGE from "../../../assets/login.jpg";

const RegisterLayout = ({ children }) => {
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
        <h1 className="text-xl text-[#060606] font-semibold">OX-Fit</h1>

        {/* Main content area */}
        <div className="w-full flex flex-col max-w-[550px]">{children}</div>
      </div>
    </div>
  );
};

export default RegisterLayout;
