import React, { useDebugValue, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setMode } from "../../features/globalSlice";
import { useGetUserQuery } from "../../features/api";
import { getUser } from "../../features/userSlice";

const Navbar = (props) => {
  const dispatch = useDispatch();
  // const userId = useSelector((state) => state.global.userId);
  // const { data, isLoading } = useGetUserQuery(userId);
  // if (!isLoading) {
  //   // console.log("data", data);
  //   dispatch(getUser(data));
  // }

  const { toggleSidebar, isSidebarOpen } = props;

  return (
    <>
      {/* Appbar */}
      {/* <nav className="w-[100%] flex-1 static bg-gray-200 p-4 shadow-none"> */}
      {/* Toolbar */}
      <nav className="flex justify-between  bg-gray-200 p-4 w-full">
        {/* LEFT SIDE */}
        {/* FlexBetween 1*/}
        <div className="flex items-center">
          <button onClick={toggleSidebar} className=" focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isSidebarOpen ? (
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
          {/* FlexBetween 2*/}
          <div className="ml-2">
            <input
              type="search"
              name=""
              placeholder="search..."
              className="bg-gray-100 rounded-lg gap-[3rem] py-[0.1rem] px-[1.5rem] border"
            />
          </div>
        </div>
        {/* RIGHT SIDE */}
        <div className="flex items-center">
          <h2 className="px-2">Settings ICON</h2>
          {/* {!isLoading && <h2 className="text-purple-400 px2">{data.name}</h2>} */}
        </div>
      </nav>
      {/* </nav> */}
      {/* <Outlet /> */}
    </>
  );
};

export default Navbar;
