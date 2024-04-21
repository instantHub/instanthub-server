import React, { useState } from "react";
import SearchBar from "./SearchBar";
import Logo from "../assets/LOGO.png";
import Slider from "./Slider";
import Categories from "../pages/categories/Categories";
import { Link, Outlet } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* <nav className="bg-[#E27D60] bg-blue-600 text-white p-4 rounded-xl mt-4 mx-4 sticky top-2 border-b border-[#E27D60] shadow-xl"> */}
      <nav className="bg-gradient-to-r from-blue-500  to-cyan-700 text-white p-4 rounded-xl mt-4 mx-4 sticky top-2 border-b border-[#E27D60] shadow-xl">
      {/* <nav className="bg-gradient-to-r from-red-700 via-yellow-400 to-orange-600 text-white p-4 rounded-xl mt-4 mx-4 sticky top-2 border-b border-[#E27D60] shadow-xl"> */}
        <div className="max-w-full mx-auto px-4">
          <div className="flex items-center">
            {/* <div className="grid grid-cols-3 items-center"> */}
            <div className="flex items-center grow">
              <Link to="/">
                <span className=" font-semibold text-lg">Your Logo</span>
              </Link>
            </div>

            <SearchBar />

            <div className="hidden  md:flex ">
              <ul className="flex space-x-4">
                <li className="">
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <a href="#" className="">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#" className="">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div className="md:hidden ">
              <button onClick={toggleMenu} className=" focus:outline-none">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {isOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16m-7 6h7"
                    ></path>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        {isOpen && (
          <div className="md:hidden mt-2 text-center  float-right">
            <ul className="flex flex-col bg-white text-black p-4 items-center justify-around space-y-2">
              <li>
                <a href="#" className="">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="">
                  Services
                </a>
              </li>
              <li>
                <a href="#" className="">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* <Outlet />

      <div>Footer</div> */}
    </>
  );
};

export default Navbar;
