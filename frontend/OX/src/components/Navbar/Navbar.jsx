import React, { useEffect, useState, useRef } from "react";
import Logo from "../../assets/logo.png";
import "../../index.css";
import { IoMdSearch } from "react-icons/io";
import { FaCaretDown } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";
import { MdDashboard, MdLogout, MdSettings } from "react-icons/md";
import { CgGym } from "react-icons/cg";
import { BsPersonVcard } from "react-icons/bs";
import DarkMode from "./DarkMode";
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth

import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Menu = [
  {
    id: 1,
    name: "Home",
    link: "/",
  },
  {
    id: 2,
    name: "Training Programs",
    link: "/programs",
  },
  {
    id: 3,
    name: "Exercise Tutorials",
    link: "/exercise",
  },
  {
    id: 4,
    name: "Progress Tracking",
    link: "/progress-tracking",
  },
  {
    id: 5,
    name: "Nutrition",
    link: "/nutrition",
  },
];

const DropDownLinks = [
  {
    id: 1,
    name: "Supplement Guide",
    link: "/supplements",
  },
  {
    id: 2,
    name: "Recipe Guide",
    link: "/recipes",
  },
  {
    id: 3,
    name: "About Us",
    link: "/aboutUs",
  },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const { logout } = useAuth(); // Use the logout function from AuthContext
  const [searchTerm, setSearchTerm] = useState(""); // Add state for search term

  // Check login status whenever component renders or location changes
  useEffect(() => {
    checkLoginStatus();

    // Listen for custom event for login status changes
    window.addEventListener("loginStatusChanged", checkLoginStatus);

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("loginStatusChanged", checkLoginStatus);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [location]); // Re-check when location changes

  // Function to check login status
  const checkLoginStatus = () => {
    const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedInStatus);

    if (loggedInStatus) {
      const email = localStorage.getItem("userEmail");
      if (email) {
        const name = email.split("@")[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    // Call the logout function from AuthContext
    logout();

    // Show logout success toast with better visibility
    toast.success("Logged out successfully", {
      position: "top-center", // Changed to top-center for better visibility
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("loginStatusChanged"));

    // Navigate to home page after toast is visible
    setTimeout(() => {
      navigate("/");
    }, 1500); // Reduced to 1.5 seconds which is still enough to see the toast
  };

  const navigateToDashboard = () => {
    navigate("/dashboard");
    setShowProfileMenu(false);
  };

  // Handle search functionality
  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) return; // Don't search if empty

    const term = searchTerm.toLowerCase();

    // Redirect based on search terms
    if (term.includes("program") || term.includes("training")) {
      navigate("/programs");
    } else if (term.includes("exercise") || term.includes("tutorial")) {
      navigate("/exercise");
    } else if (term.includes("progress") || term.includes("track")) {
      navigate("/progress-tracking");
    } else if (
      term.includes("nutrition") ||
      term.includes("diet") ||
      term.includes("food")
    ) {
      navigate("/nutrition");
    } else if (term.includes("supplement")) {
      navigate("/supplements");
    } else if (term.includes("recipe")) {
      navigate("/recipes");
    } else if (term.includes("about")) {
      navigate("/aboutUs");
    } else if (
      (term.includes("dashboard") || term.includes("profile")) &&
      isLoggedIn
    ) {
      term.includes("profile") ? navigate("/profile") : navigate("/dashboard");
    } else {
      // If no specific match, show a toast message
      toast.info(`Searching for "${searchTerm}"`, { position: "top-center" });
      // Could implement a more comprehensive search results page in the future
    }

    // Clear search after submission
    setSearchTerm("");
  };

  return (
    <div
      className="shadow-md bg-white
    dark:bg-gray-900 dark:text-white duration-200 relative z-40"
    >
      {/* upper navbar */}
      <div className="bg-primary/40 py-2">
        <div className="container flex justify-between items-center">
          <div>
            <NavLink
              to="/"
              className="font-bold text-2xl sm:text-3xl flex items-center gap-2"
            >
              <img src={Logo} alt="logo" className="w-16" />
              <span>OX-Fit</span>
            </NavLink>
          </div>

          {/* search bar and login/logout button */}
          <div className="flex justify-between items-center gap-4 ">
            <div className="relative group hidden sm:block">
              <form onSubmit={handleSearch} className="m-0 p-0">
                <input
                  type="text"
                  placeholder="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[200px] sm:w-[200px] 
                      group-hover:w-[300px] transition-all 
                      duration-300 rounded-full border
                      border-gray-300 px-2 py-1 
                      focus:outline-none focus:border-1 
                      focus:border-primary"
                />
                <button
                  type="submit"
                  className="absolute top-1/2 -translate-y-1/2 right-3 bg-transparent border-0 p-0 cursor-pointer"
                >
                  <IoMdSearch className="text-gray-500 group-hover:text-primary" />
                </button>
              </form>
            </div>

            {/* Dark mode switch */}
            <div>
              <DarkMode />
            </div>

            {/* Login/Profile section - SIMPLIFIED */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                {/* Profile Button with Dropdown */}
                <div ref={profileMenuRef} className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={`flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white py-1.5 px-4 rounded-full hover:shadow-md transition-all duration-200 ${
                      showProfileMenu ? "shadow-lg" : ""
                    }`}
                    aria-label="User menu"
                  >
                    <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">
                      {localStorage.getItem("userEmail") || "User"}
                    </span>
                    <FaUserCircle className="text-lg" />
                  </button>

                  {/* Profile dropdown menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Signed in as
                        </p>
                        <p className="font-medium truncate">
                          {localStorage.getItem("userEmail") ||
                            "user@example.com"}
                        </p>
                      </div>

                      <NavLink
                        to="/dashboard"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700"
                      >
                        <MdDashboard className="mr-2 text-primary" />
                        Dashboard
                      </NavLink>

                      <NavLink
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700"
                      >
                        <BsPersonVcard className="mr-2 text-primary" />
                        My Profile
                      </NavLink>

                      <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700"
                        >
                          <MdLogout className="mr-2 text-red-500" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-gradient-to-r from-primary to-secondary transition-all duration-200 text-white py-2 px-4 rounded-full ml-4"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
      {/* lower navbar */}
      <div className="flex justify-center">
        <ul className="sm:flex hidden items-center gap-4">
          {Menu.map((data) => (
            <li key={data.id}>
              <NavLink
                to={data.link}
                className="inline-block px-4 hover:text-primary duration-200"
              >
                {data.name}
              </NavLink>
            </li>
          ))}
          {/* simple drop down button and links */}
          <li className="group relative cursor-pointer">
            <a href="#" className="flex items-center gap-[2px] py-2">
              Others
              <span>
                <FaCaretDown
                  className="transition-all
                duration-200
                group-hover:rotate-180"
                />
              </span>
            </a>
            <div className="absolute z-[9999] hidden group-hover:block w-[150px] rounded-md bg-white p-2 text-black shadow-md">
              <ul>
                {DropDownLinks.map((data) => (
                  <li key={data.id}>
                    <NavLink
                      to={data.link}
                      className="inline-block w-full rounded-md p-2 hover:bg-primary/20"
                    >
                      {data.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
