import React from "react";
import Slider from "../../components/slider/Slider";
import Categories from "../categories/Categories";

const Home = () => {
    const images = [
        "https://instantcashpick.com/admin/uploads/sliders/2023-06-27-01-22-2420230627012224pickmyphonepickmyphone%20banner-01.jpg",
        "https://instantcashpick.com/admin/uploads/sliders/2023-06-27-01-22-3220230627012232pickmyphonepickmyphone%20banner-02.jpg",
        "https://instantcashpick.com/admin/uploads/sliders/2024-03-17-10-03-3820240317100338pickmyphonepexels-lukas-kloeppel-466685.jpg",
        // Add more image URLs as needed
      ];
  return (
    <>
      <Slider images={images} />
      <Categories />
    </>
  );
};

export default Home;
