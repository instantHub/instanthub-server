import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../components/Navbar";
import SideBar from "../../components/SideBar";

const Layout = () => {
  // const
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex sm:block ">
      <div className="h-full">
        {/* <SideBar user={data || {}} isSidebarOpen={isSidebarOpen} /> */}
        <SideBar isSidebarOpen={isSidebarOpen} />
      </div>
      {/* <div className={`${isSidebarOpen ? "ml-[10%]" : ""} `}> */}
      <div className={` ml-[10%] `}>
        {/* <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} /> */}
        <Navbar  isSidebarOpen={isSidebarOpen} />
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;

{
  /* <h2>Layout</h2> */
}
{
  /* <SideBar
          drawerWidth="250px"
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        /> */
}

{
  /* <Navbar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          /> */
}
