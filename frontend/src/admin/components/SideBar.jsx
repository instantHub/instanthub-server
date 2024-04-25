import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const SideBar = (props) => {
  //   const { isSidebarOpen, setIsSidebarOpen, drawerWidth } = props;

  const { user, isSidebarOpen } = props;

  const sideBarLinks = [
    {
      text: "Dashboard",
      url: "dashboard",
    },
    {
      text: "Products",
      url: "productsList",
    },
    {
      text: "Add Products",
      url: "add-products",
    },
    // {
    //   text: "Categories",
    //   url: "categories",
    // },
    {
      text: "Add Category",
      url: "add-category",
    },
    // {
    //   text: "Brands",
    //   url: "brands",
    // },
    {
      text: "Add Brands",
      url: "add-brands",
    },
    {
      text: "Add Series",
      url: "add-series",
    },
    {
      text: "Questions",
      url: "questions",
    },
    {
      text: "Orders",
      url: "orders",
    },
    {
      text: "Sliders",
      url: "add-sliders",
    },
    {
      text: "Setting",
      url: "update-profile",
    },
  ];

  const { pathname } = useLocation();
  const [active, setActive] = useState(false);
  const navigate = useNavigate();

  const handleActive = () => {
    setActive(!active);
  };

  useEffect(() => {
    setActive(pathname.substring(1));
  }, [pathname]);

  return (
    <div
      className={`${
        isSidebarOpen ? "block" : "hidden"
      }  md-[15%] lg:w-[10%] h-full bg-gray-900 text-white fixed`}
    >
      <ul className="flex flex-col my-28 items-center">
        {sideBarLinks.map(({ text, url }, i) => {
          return (
            <li className={`my-4 `} key={i}>
              {/* <button onClick={handleActive}> */}
              <button className="text-xl">
                <Link
                  to={`/admin/${url}`}
                  // className={`${active ? "bg-white" : ""} `}
                >
                  {text}
                </Link>
              </button>
            </li>
          );
        })}

        {/*   */}
      </ul>
    </div>
  );
};

export default SideBar;
