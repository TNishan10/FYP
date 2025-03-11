import React, { useEffect, useState } from "react";
import Logo from "../../assets/logo.png";
import "../../index.css";
import { IoMdSearch } from "react-icons/io";
import { FaCaretDown } from "react-icons/fa6";
import DarkMode from "./DarkMode";
import { NavLink, useNavigate } from "react-router-dom";

const Menu = [
  {
    id: 1,
    name: "Home",
    link: "/#",
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
    link: "/progress",
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedInStatus);

    const handleStorageChange = () => {
      const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(loggedInStatus);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/login");
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
            <a href="#" className="font-bold text-2xl sm:text-3xl flex gap-2">
              <img src={Logo} alt="logo" className="w-16" />- Fit
            </a>
          </div>

          {/* search bar and login/logout button */}
          <div className="flex justify-between items-center gap-4 ">
            <div className="relative group hidden sm:block">
              <input
                type="text"
                placeholder="search"
                className="w-[200px] sm:w-[200px] 
                    group-hover:w-[300px] transition-all 
                    duration-300 rounded-full border
                     border-gray-300 px-2 py-1 
                     focus:outline-none focus:border-1 
                     focus:border-primary"
              />
              <IoMdSearch
                className="text-gray-500 group-hover:text-primary 
                absolute top-1/2 -translate-y-1/2 
                right-3"
              />
            </div>

            {/* Dark mode switch */}
            <div>
              <DarkMode />
            </div>

            {/* Login/Logout button */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded-full ml-4"
              >
                Logout
              </button>
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
            <NavLink to={data.link} key={data.id}>
              <li key={data.id}>
                <a
                  href={data.link}
                  className="inline-block px-4 hover:text-primary duration-200"
                >
                  {data.name}
                </a>
              </li>
            </NavLink>
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
                    <a
                      href={data.link}
                      className="inline-block w-full rounded-md p-2 hover:bg-primary/20"
                    >
                      {data.name}
                    </a>
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
