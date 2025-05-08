import React from "react";

const stats = [
  { title: "Total Users", value: "1,200", color: "bg-[#f9bd04]" },
  { title: "Total Sales", value: "$45,600", color: "bg-[#fe5f55]" },
  { title: "New Signups", value: "320", color: "bg-[#3151f9]" },
];

const Cards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className={`${stat.color} text-white p-6 rounded-lg shadow-md`}>
          <h3 className="text-xl font-semibold">{stat.title}</h3>
          <p className="text-3xl font-bold mt-2">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default Cards;
