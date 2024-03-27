import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const SideBar = (props) => {
  //   const { isSidebarOpen, setIsSidebarOpen, drawerWidth } = props;

  const { user, isSidebarOpen } = props;

  const sideBarLinks = [
    {
      text: "Dashboard",
      url: "",
    },
    {
      text: "Products",
      url: "products",
    },
    {
      text: "Add Products",
      url: "add-products",
    },
    {
      text: "Add Category",
      url: "add-category",
    },
    {
      text: "Questions",
      url: "Icon",
    },
    {
      text: "Setting",
      url: "Icon",
    },
  ];

  const { pathname } = useLocation();
  const [active, setActive] = useState("");
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
      }  w-[10%] h-full bg-gray-200 fixed`}
    >
      <ul className="flex flex-col my-28 items-center">
        {sideBarLinks.map(({ text, url }, i) => {
          return (
            <li className={`${active ? "bg-white" : ""} my-4 `} key={i}>
              <button onClick={handleActive}>
                <Link to={`/admin/${url}`}>{text}</Link>
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
