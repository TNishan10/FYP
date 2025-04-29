import React, { useEffect, useState, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";
import Hero from "./components/Hero/Hero.jsx";
import Programs from "./components/Programs/Programs.jsx";
import TopPrograms from "./components/TopPrograms/TopPrograms.jsx";
import Banner from "./components/Banner/Banner.jsx";
import Notification from "./components/Notification/Notification.jsx";
import Testimonials from "./components/Testimonials/Testimonials.jsx";
import Footer from "./components/Footer/Footer.jsx";
import Popup from "./components/Popup/Popup.jsx";
import AOS from "aos";
import "aos/dist/aos.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SessionTimeout from "./components/SessionTimeout.jsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";

const App = () => {
  const { isAuthenticated } = useAuth();
  const programsRef = useRef(null);
  const location = useLocation();
  const [orderPopup, setOrderPopup] = useState(false);

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

  const isHomePage = location.pathname === "/";

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white duration-200">
      <Navbar handleOrderPopup={handleOrderPopup} />

      <div className="content-container min-h-screen">
        {isHomePage ? (
          <>
            <Hero
              handleOrderPopup={handleOrderPopup}
              programsRef={programsRef}
            />
            <div ref={programsRef}>
              <Programs />
            </div>
            <TopPrograms handleOrderPopup={handleOrderPopup} />
            <Banner />
            <Notification />
            <Testimonials />
          </>
        ) : (
          <Outlet />
        )}
      </div>

      <Footer />
      <Popup orderPopup={orderPopup} setOrderPopup={setOrderPopup} />
      {isAuthenticated && <SessionTimeout />}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </div>
  );
};

export default App;
