// // admin js
// import React, { useState } from "react";
// import { Outlet } from "react-router-dom";
// import { useSelector } from "react-redux";
// import Navbar from "../../components/Navbar";
// import SideBar from "../../components/SideBar";
// // import { UseSelector } from "react-redux";

// const Layout = () => {
//   // const
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);

//   const checkRedux = useSelector((state) => state.global);
//   console.log("global ", checkRedux);

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   return (
//     <div className="flex sm:block ">
//       <div className="flex-1 h-full">
//         <SideBar isOpen={isSidebarOpen} isSidebarOpen={isSidebarOpen} />
//       </div>
//       <div className="flex-1 ">
//         <Navbar toggleSidebar={toggleSidebar} isOpen={isSidebarOpen} />
//         <Outlet />
//       </div>
//     </div>
//   );
// };

// export default Layout;

// //  end of admin js

// // navbar js
// import React, { useDebugValue, useState } from "react";
// import { Outlet } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { setMode } from "../../features/globalSlice";
// import SideBar from "./SideBar";

// const Navbar = (props) => {
//   const dispatch = useDispatch();

//   const { toggleSidebar, isOpen } = props;

//   return (
//     <>
//       {/* Appbar */}
//       <nav className="w-[100%] flex-1 static bg-gray-200 p-4 shadow-none">
//         {/* Toolbar */}
//         <div className="flex justify-between">
//           {/* LEFT SIDE */}
//           {/* FlexBetween 1*/}
//           <div className="flex  items-center">
//             <button onClick={toggleSidebar} className=" focus:outline-none">
//               <svg
//                 className="w-6 h-6"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 {isOpen ? (
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 ) : (
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M4 6h16M4 12h16m-7 6h7"
//                   ></path>
//                 )}
//               </svg>
//             </button>
//             {/* FlexBetween 2*/}
//             <div className="ml-2">
//               <input
//                 type="search"
//                 name=""
//                 placeholder="search..."
//                 className="bg-gray-100 rounded-lg gap-[3rem] py-[0.1rem] px-[1.5rem] border"
//               />
//             </div>
//           </div>

//           <div>
//             <h2>setting ICON</h2>
//           </div>
//         </div>
//       </nav>
//       {/* <Outlet /> */}
//     </>
//   );
// };

// // export default Navbar;

// // end of navbar js

// // sidebar js

// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate, Link } from "react-router-dom";

// const SideBar = (props) => {
//   //   const { isSidebarOpen, setIsSidebarOpen, drawerWidth } = props;
//   //   console.log(isSidebarOpen, setIsSidebarOpen, drawerWidth);

//   const { isOpen, isSidebarOpen } = props;

//   const { pathname } = useLocation();
//   const [active, setActive] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     setActive(pathname.substring(1));
//   }, [pathname]);

//   console.log("isSidebarOpen", isSidebarOpen);

//   return (
//     <div
//       className={`sidebar ${
//         isOpen ? "block" : "hidden"
//       }  w-[10%] h-full bg-gray-200 flex-1 float-left border-1 border-r-red-400`}
//     >
//       {/* <nav className="bg-gray-200 p-2 top-2  text-black"> */}
//       {/* <div className=""> */}
//       <ul className="flex flex-col my-28 items-center">
//         <li className="my-4">
//           <Link to="/admin">Home</Link>
//         </li>
//         <li className="my-4">
//           <Link>About</Link>
//         </li>
//         <li className="my-4">
//           <a href="#" className="">
//             Services
//           </a>
//         </li>
//         <li className="my-4">
//           <a href="#" className="">
//             Contact
//           </a>
//         </li>
//       </ul>
//       {/* </div> */}
//       {/* </nav> */}
//     </div>
//   );
// };

// // export default SideBar;

// // end of sidebar
