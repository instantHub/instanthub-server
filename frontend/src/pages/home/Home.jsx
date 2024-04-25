import React from "react";
import Slider from "../../components/Slider";
import Categories from "../categories/Categories";
import Testimonials from "../../components/Testimonials";
import TestimonialCarousel from "../../components/TestimonialsCorousel";

const Home = () => {
  const images = [
    {
      url: "https://instantcashpick.com/admin/uploads/sliders/2023-06-27-01-22-2420230627012224pickmyphonepickmyphone%20banner-01.jpg",
    },
    {
      url: "https://instantcashpick.com/admin/uploads/sliders/2023-06-27-01-22-3220230627012232pickmyphonepickmyphone%20banner-02.jpg",
    },
    {
      url: "https://instantcashpick.com/admin/uploads/sliders/2024-03-17-10-03-3820240317100338pickmyphonepexels-lukas-kloeppel-466685.jpg",
    },
  ];
  return (
    <>
      {/* <Slider images={images} /> */}
      <Slider />
      <Categories />
      {/* <Testimonials /> */}
      <TestimonialCarousel />
    </>
  );
};

export default Home;
