import React, { useDebugValue, useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  useAdminLogoutMutation,
  useAdminProfileQuery,
} from "../../features/adminApiSlice";
import { useNavigate } from "react-router-dom";
import { logout } from "../../features/authSlice";
import { toast } from "react-toastify";

const Navbar = (props) => {
  const dispatch = useDispatch();
  const { adminInfo } = useSelector((state) => state.auth);
  const { adminProfile, isLoading } = useAdminProfileQuery();
  // console.log("adminInfo", adminInfo);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const { toggleSidebar, isSidebarOpen } = props;

  const [adminLogout] = useAdminLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await adminLogout();
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate("/admin/login");
    } catch (error) {}
  };

  return (
    <>
      {/* Appbar */}
      {/* Toolbar */}
      <nav className="flex justify-end  bg-gray-200 p-4 w-full">
        {/* LEFT SIDE */}
        {/* FlexBetween 1*/}

        {/* RIGHT SIDE */}
        <div className="flex items-center">
          {adminInfo && (
            <div className="flex items-center justify-between flex-wrap">
              <div className="flex items-center flex-shrink-0 text-white mr-6">
                <button
                  onClick={toggleDropdown}
                  className="ml-4 text-black hover:text-white focus:outline-none"
                >
                  {adminInfo.name}
                </button>
              </div>
              {isDropdownOpen && (
                <div className="absolute mt-32 w- bg-white rounded-lg shadow-lg">
                  <div className="py-1">
                    <Link to={"/admin/update-profile"}>
                      <h1 className="block px-4 py-2 text-gray-800 hover:bg-gray-300">
                        Profile
                      </h1>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-300"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
      {/* </nav> */}
      {/* <Outlet /> */}
    </>
  );
};

export default Navbar;

{
  {
    /* LEFT SIDE */
  }
  /* <div className="flex items-center">
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
{/* FlexBetween 2*/
}
{
  /* <div className="ml-2">
  <input
    type="search"
    name=""
    placeholder="search..."
    className="bg-gray-100 rounded-lg gap-[3rem] py-[0.1rem] px-[1.5rem] border"
  />
</div> */
}
// </div>
