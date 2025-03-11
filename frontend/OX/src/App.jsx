import React, { useEffect, useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";
import Hero from "./components/Hero/Hero.jsx";
import Login from "./pages/Login.jsx";
import Programs from "./components/Programs/Programs.jsx";
import TopPrograms from "./components/TopPrograms/TopPrograms.jsx";
import Banner from "./components/Banner/Banner.jsx";
import Notification from "./components/Notification/Notification.jsx";
import Testimonials from "./components/Testimonials/Testimonials.jsx";
import Footer from "./components/Footer/Footer.jsx";
import Popup from "./components/Popup/Popup.jsx";
import AOS from "aos";
import "aos/dist/aos.css";

const App = () => {
  const [orderPopup, setOrderPopup] = useState(false);
  const programsRef = useRef(null);

  const handleOrderPopup = () => {
    setOrderPopup(!orderPopup);
  };

  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in-sine",
      delay: 100,
    });
    AOS.refresh();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white duration-200">
      <Navbar handleOrderPopup={handleOrderPopup} />
      <Hero handleOrderPopup={handleOrderPopup} programsRef={programsRef} />
      <div ref={programsRef}>
        <Programs />
      </div>
      <TopPrograms handleOrderPopup={handleOrderPopup} />
      <Banner />
      <Notification />
      <Testimonials />
      <Footer />
      <Popup orderPopup={orderPopup} setOrderPopup={setOrderPopup} />
    </div>
  );
};

export default App;
