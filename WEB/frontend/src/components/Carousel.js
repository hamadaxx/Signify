import React, { useEffect, useRef } from "react";
import Swiper from "swiper/bundle";
import "swiper/css/bundle";

// Import local images
import image1 from "../assets/sign4.jpg";
import image2 from "../assets/sign5.jpg";
import image3 from "../assets/sign6.jpg";

const Carousel = () => {
  const swiperRef = useRef(null);

  useEffect(() => {
    if (swiperRef.current) {
      new Swiper(swiperRef.current, {
        spaceBetween: 30,
        slidesPerView: 1,
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
        loop: true
      });
    }
  }, []);

  const slides = [
    {
      image: image1,
      title: "Learn at Your Own Pace",
      description: "Take interactive courses that let you learn ASL at your own speed, with personalized feedback."
    },
    {
      image: image2,
      title: "Instant Text-to-ASL",
      description: "Easily convert any text into sign language in seconds with our advanced conversion tool."
    },
    {
      image: image3,
      title: "Join a Supportive Community",
      description: "Become part of a growing community where you can share knowledge, resources, and improve together."
    },
  ];

  return (
    <div className="py-10 bg-gradient-to-r from-[#f9bd04] via-[#f95e54] to-[#3151f9]">
      <div ref={swiperRef} className="swiper max-w-4xl mx-auto">
        <div className="swiper-wrapper">
          {slides.map((slide, index) => (
            <div key={index} className="swiper-slide text-center">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-72 object-cover rounded-lg shadow-lg"
              />
              <h3 className="text-2xl font-bold text-[#3151f9] mt-4">{slide.title}</h3>
              <p className="text-gray-600">{slide.description}</p>
            </div>
          ))}
        </div>
        <div className="swiper-pagination"></div>
        <div className="swiper-button-prev"></div>
        <div className="swiper-button-next"></div>
      </div>
    </div>
  );
};

export default Carousel;
