import React from "react";
import COVER_IMAGE from "../../../assets/login.jpg";

const RegisterLayout = ({ children }) => {
  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row">
      {/* Left side - Image */}
      <div className="relative w-full md:w-1/2 h-screen md:sticky md:top-0">
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10"></div>

        <div className="absolute top-[20%] left-[10%] flex flex-col z-20 max-w-[80%]">
          <h1 className="text-4xl md:text-5xl text-white font-bold my-4 leading-tight drop-shadow-md">
            BEGIN YOUR <span className="text-orange-400">FITNESS JOURNEY</span>{" "}
            TODAY
          </h1>
          <p className="text-xl text-white font-normal leading-relaxed drop-shadow-sm">
            Create your account to access personalized workout plans, nutrition
            tracking, and join our supportive fitness community
          </p>
        </div>
        <img
          src={COVER_IMAGE}
          alt="gym-image"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col p-12 md:p-20 justify-between shadow-inner">
        <h1 className="text-2xl text-gray-800 font-bold">
          OX-<span className="text-orange-500">Fit</span>
        </h1>

        {/* Main content area */}
        <div className="w-full flex flex-col max-w-[550px] bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          {children}
        </div>

        {/* Added subtle footer */}
        <div className="text-sm text-gray-400 mt-6">
          © 2025 OX-Fit. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default RegisterLayout;
