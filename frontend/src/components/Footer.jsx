import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    // JSX
    <div className=" w-full sm:pt-10 mt-2 pb-4 bg-[#E27D60] bg-cyan-500 px-4 py-2">
      <div className="mx-auto max-w-screen-xl flex gap-4 justify-evenly max-md:gap-1">
        <div className="px-4 sm:px-0 flex flex-col">
          <div>
            <img src="" alt="LOGO" />
          </div>
          <div>
            <span className="text-xs text-white">Follow Us On</span>
            <ul className="flex gap-3 text-md my-3">
              <li>
                <FaFacebookF />
              </li>
              <li>
                <FaInstagram />
              </li>
              <li>
                <FaWhatsapp />
              </li>
            </ul>
          </div>
        </div>
        <div>
          <div className="text-white font-bold py-2">
            <label htmlFor="">Services</label>
          </div>
          <div className="pl-2">
            <ul className="flex flex-col text-[13px] leading-8 font-thin">
              <li>
                <Link>
                  <span>Sell Mobile</span>
                </Link>
              </li>
              <li>
                <Link>
                  <span>Sell Laptop</span>
                </Link>
              </li>
              <li>
                <Link>
                  <span>Sell Tablets</span>
                </Link>
              </li>
              <li>
                <Link>
                  <span>Sell Earbuds</span>
                </Link>
              </li>
              <li>
                <Link>
                  <span>Sell Cameras</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div>
          <div className="text-white font-bold py-2">
            <label htmlFor="">Company</label>
          </div>
          <div className="pl-2">
            <ul className="flex flex-col text-[13px] leading-8 font-thin">
              <li>
                <Link>
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link>
                  <span>Partner with Us</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div>
          <div className="text-white font-bold py-2">
            <label htmlFor="">Support</label>
          </div>
          <div className="pl-2">
            <ul className="flex flex-col text-[13px] leading-8 font-thin">
              <li>
                <Link>
                  <span>FAQ</span>
                </Link>
              </li>
              <li>
                <Link>
                  <span>Contact Us</span>
                </Link>
              </li>
              <li>
                <Link>
                  <span>Warranty Policy</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div>
          <div className="text-white font-bold py-2">
            <label htmlFor="">MoreAbout Us</label>
          </div>
          <div className="pl-2">
            <ul className="flex flex-col text-[13px] leading-8 font-thin">
              <li>
                <Link>
                  <span>Privary Policy</span>
                </Link>
              </li>
              <li>
                <Link>
                  <span>Terms & Conditions</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-md:hidden">
          <div className="text-white font-bold py-2">
            <label htmlFor="">Our Office</label>
          </div>
          <div className="pl-2 flex flex-col items-center">
            <p className="text-xs">RT Nagar, Bangalore-560032</p>
            <p className="text-xs">Ph: +91 1234567890</p>
            <p className="text-xs">sale@instantcashpick.com</p>
            <p className="text-xs">info@instantcashpick.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
