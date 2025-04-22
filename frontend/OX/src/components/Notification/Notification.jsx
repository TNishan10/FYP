import React from "react";
import { useNavigate } from "react-router-dom";
import Banner from "../../assets/orange-pattern.jpg";

const BannerImg = {
  backgroundImage: `url(${Banner})`,
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  height: "100%",
  width: "100%",
};

const Notification = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/login");
  };

  return (
    <div
      data-aos="zoom-in"
      className="mb-20 bg-gray-100 dark:bg-gray-800 text-white"
      style={BannerImg}
    >
      <div className="container backdrop-blur-sm py-10">
        <div className="space-y-6 max-w-xl mx-auto text-center">
          <h1 className="text-2xl sm:text-4xl font-semibold">
            Become a member
          </h1>
          <p className="text-white/80">
            Join OX-Fit today to access all our premium features and start your
            fitness journey
          </p>
          <button
            onClick={handleSignIn}
            className="bg-white text-primary hover:bg-white/90 px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
