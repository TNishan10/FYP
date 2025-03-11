import React from "react";
import Img1 from "../../assets/trainers/t1.jpeg";
import Img2 from "../../assets/trainers/t3.jpeg";
import Img3 from "../../assets/trainers/t1.jpeg";
import Img4 from "../../assets/trainers/t2.jpeg";
import Img5 from "../../assets/trainers/neha.jpeg";
import { FaStar } from "react-icons/fa6";

const ProgramsData = [
  {
    id: 1,
    img: Img1,
    title: "Hypertrophy",
    rating: 5.0,
    color: "white",
    aosDelay: "0",
  },
  {
    id: 2,
    img: Img2,
    title: "Beginner Program",
    rating: 4.5,
    color: "Red",
    aosDelay: "200",
  },
  {
    id: 3,
    img: Img3,
    title: "Powerbuilding",
    rating: 4.7,
    color: "brown",
    aosDelay: "200",
  },
  {
    id: 4,
    img: Img4,
    title: "Fat Loss",
    rating: 4.5,
    color: "Yellow",
    aosDelay: "600",
  },
  {
    id: 5,
    img: Img5,
    title: "Glute Builder",
    rating: 4.5,
    color: "Pink",
    aosDelay: "800",
  },
];

const Products = () => {
  return (
    <div className="mt-14 mb-12">
      <div className="container">
        {/** Header Section */}
        <div className="text-center mb-10 max-w-[600px] mx-auto">
          <p data-aos="fade-up" className="text-sm text-primary">
            Top Selling Programs for you
          </p>
          <h1 data-aos="fade-up" className="text-3xl font-bold">
            Programs
          </h1>
          <p data-aos="fade-up" className="text-xs text-gray-400">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Saepe
            quasi, labore voluptas nobis illo,
          </p>
        </div>
        {/** Body section */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 place-items-center gap-5">
            {/** Product Card */}
            {ProgramsData.map((data) => (
              <div
                data-aos="fade-up"
                data-aos-delay={data.aosDelay}
                key={data.id}
                className="space-y-3"
              >
                <img
                  src={data.img}
                  alt=""
                  className="h-[220px] w-[150px] object-cover rounded-md"
                />
                <div>
                  <h3 className="font-semibold">{data.title}</h3>
                  <p className="text-sm text-gray-600">{data.color}</p>
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span>{data.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* View all button */}
          <div className="flex justify-center">
            <button className="text-center mt-10 cursor-pointer bg-primary text-white py-1 px-5 rounded-md">
              View all Programs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
