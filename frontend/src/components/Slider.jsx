import React, { useState } from "react";
import { useEffect } from "react";
// import "./Slider.css";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { RxDotFilled } from "react-icons/rx";
import { useGetSlidersListQuery } from "../features/api";

function Slider() {
  const { data: slidersData, isLoading: slidersLoading } =
    useGetSlidersListQuery();
  const [slidersList, setSlidersList] = useState([]);

  if (!slidersLoading) {
    // console.log(slidersList);
  }

  console.log("slidersList", slidersList);
  console.log("slidersList length", slidersList.length);

  const baseURL = import.meta.env.VITE_APP_BASE_URL;
  // console.log(baseURL);

  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const index = isFirstSlide ? slidersList.length - 1 : currentIndex - 1;
    setCurrentIndex(index);
  };

  const goToNextSlide = () => {
    // console.log("goToNextSlide", slidersList.length);
    // if (slidersList.length == 1) {
    //   return;
    // }
    const isLastSlide = currentIndex === slidersList.length - 1;
    const index = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(index);
  };

  const gotoSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  useEffect(() => {
    // Automatically move to the next slide every 3 seconds

    const intervalId = setInterval(goToNextSlide, 4000);

    // Clean up the interval when the component unmounts or when currentIndex changes
    return () => clearInterval(intervalId);
  }, [currentIndex]);

  useEffect(() => {
    if (!slidersLoading) {
      const sliders = slidersData.filter(
        (slider) => slider.status === "Active"
      );
      setSlidersList(sliders);
    }
  }, [slidersData]);

  return (
    // <div className="max-w-[1400px] h-[480px] w-full m-auto py-8 px-4 relative group">
    // TODO: need to set this div to relative for right and left arrow functionality, however navbar will be affected
    <div className="max-w-[1400px] w-full h-[480px] mx-auto mt-10  max-md:h-[200px] group">
      {!slidersLoading && slidersList.length !== 0 && (
        <div
          style={{
            backgroundImage: `url(${baseURL}${slidersList[currentIndex].image})`,
          }}
          className="w-full h-full rounded-2xl bg-cover bg-center bg-no-repeat duration-500"
        >
          {/* left arrow */}
          {/* <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[50] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
            <BsChevronCompactLeft size={30} onClick={goToPrevSlide} />
          </div> */}
          {/* right arrow */}
          {/* <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[50] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
            <BsChevronCompactRight size={30} onClick={goToNextSlide} />
          </div> */}
        </div>
      )}

      <div className="flex top-4 justify-center py-2">
        {!slidersLoading &&
          slidersList.map((image, index) => (
            <div
              key={index}
              onClick={() => gotoSlide(index)}
              className="text-2xl cursor-pointer"
            >
              <RxDotFilled />
            </div>
          ))}
      </div>
    </div>
  );
}

export default Slider;
