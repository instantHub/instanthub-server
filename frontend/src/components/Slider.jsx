import React, { useState } from "react";
import { useEffect } from "react";
// import "./Slider.css";

function Slider({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevSlide = () => {
    const index = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(index);
  };

  const goToNextSlide = () => {
    const index = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(index);
  };

  useEffect(() => {
    // Automatically move to the next slide every 3 seconds
    const intervalId = setInterval(goToNextSlide, 3000);

    // Clean up the interval when the component unmounts or when currentIndex changes
    return () => clearInterval(intervalId);
  }, [currentIndex]);

  return (
    <div className="w-2/3 mx-auto mt-10">
      <div className="slide">
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex}`}
          className="w-full h-96 rounded-[20px]"
        />
      </div>
      {/* <div className="fixed top-1/2 left-0 right-0 -translate-y-full">
        <button
          className="float-left ml-16 cursor-pointer mb-32 ml-80"
          onClick={goToPrevSlide}
        >
          prev
        </button>
        <button
          className="float-right mr-16 cursor-pointer mb-32 mr-80"
          onClick={goToNextSlide}
        >
          Next
        </button>
      </div> */}
    </div>
  );
}

export default Slider;
