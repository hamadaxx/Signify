import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import Carousel from '../Carousel';
import AboutUs from './AboutUs';
import Footer from './Footer';

const Homepage = () => {
  return (
    <div className="font-sans bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

 {/* Carousel Section */}
 <Carousel />
      {/* Features Section */}
      <FeaturesSection />


      {/* About Us Section */}
      <AboutUs />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Homepage;
