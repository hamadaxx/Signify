// FeaturesSection.js
import React from 'react';

const FeaturesSection = () => (
  <section className="py-16 bg-gradient-to-r from-[#f9bd04] via-[#f95e54] to-[#3151f9] text-center">
    <h2 className="text-4xl font-bold text-white mb-8">Our Features</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
      <div className="p-6 bg-[#fe5f55] border-4 border-[#fe5f55] shadow-xl rounded-lg transform hover:scale-105 transition-transform duration-300 ease-in-out">
        <h3 className="text-2xl font-semibold mb-4 text-white">Interactive Courses</h3>
        <p className="text-white text-lg">Engage in lessons with real-time feedback and hands-on practice.</p>
      </div>
      <div className="p-6 bg-[#fbc102e3] border-4 border-[#fbc102e3] shadow-xl rounded-lg transform hover:scale-105 transition-transform duration-300 ease-in-out">
        <h3 className="text-2xl font-semibold mb-4 text-[#3151f9]">Text-to-ASL Conversion</h3>
        <p className="text-[#3151f9] text-lg">Instantly convert any text into ASL signs using our advanced tool.</p>
      </div>
      <div className="p-6 bg-[#2d49e8] border-4 border-[#3151f9] shadow-xl rounded-lg transform hover:scale-105 transition-transform duration-300 ease-in-out">
        <h3 className="text-2xl font-semibold mb-4 text-white">Quizzes & Challenges</h3>
        <p className="text-white text-lg">Test your knowledge and improve with interactive quizzes.</p>
      </div>
    </div>
  </section>
);

export default FeaturesSection;
