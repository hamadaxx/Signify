import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <h1 className="text-2xl font-bold">SIGNIFY</h1>
      <div className="space-x-4">
        <Link to="/signin" className="hover">Sign In</Link>
        <Link to="/signup" className="hover">Sign Up</Link>
      </div>
    </nav>
  );
};

export default Navbar;
