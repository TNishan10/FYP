import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import fallbackImg from "../../assets/trainers/nishan.jpeg";

const TopPrograms = ({ handleOrderPopup }) => {
  const [favoritePrograms, setFavoritePrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/auth/training-programs"
        );

        if (response.data.success) {
          // Get 3 random programs for "client favorites"
          const allPrograms = response.data.data;
          const shuffled = [...allPrograms].sort(() => 0.5 - Math.random());
          setFavoritePrograms(shuffled.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  return (
    <div>
      <div className="container">
        {/* Header section */}
        <div className="text-left mb-24">
          <p data-aos="fade-up" className="text-sm text-primary">
            Most Popular Programs
          </p>
          <h1 data-aos="fade-up" className="text-3xl font-bold">
            Clients Favourite
          </h1>
          <p data-aos="fade-up" className="text-xs text-gray-400">
            Our top-rated training programs loved by our clients
          </p>
        </div>

        {/* Body section */}
        {loading ? (
          <div className="text-center py-10">Loading favorite programs...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-20 md:gap-5 place-items-center">
            {favoritePrograms.map((program) => (
              <div
                key={program.program_id}
                data-aos="zoom-in"
                className="rounded-2xl bg-white dark:bg-gray-800 hover:bg-black/80 dark:hover:bg-primary hover:text-white relative shadow-xl duration-300 group max-w-[300px]"
              >
                {/* image section */}
                <div className="h-[100px]">
                  <img
                    src={program.image_url || fallbackImg}
                    alt={program.title}
                    className="max-w-[140px] block mx-auto transform -translate-y-20 group-hover:scale-105 duration-300 drop-shadow-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackImg;
                    }}
                  />
                </div>
                {/* details section */}
                <div className="p-4 text-center">
                  {/* star rating */}
                  <div className="w-full flex items-center justify-center gap-1">
                    <FaStar className="text-yellow-500" />
                    <FaStar className="text-yellow-500" />
                    <FaStar className="text-yellow-500" />
                    <FaStar className="text-yellow-500" />
                    {Math.random() > 0.5 && (
                      <FaStar className="text-yellow-500" />
                    )}
                  </div>
                  <h1 className="text-xl font-bold">{program.title}</h1>
                  <p className="text-gray-500 group-hover:text-white duration-300 text-sm line-clamp-2">
                    {program.description ||
                      "A professionally designed training program to help you achieve your fitness goals."}
                  </p>
                  <button
                    className="bg-primary hover:scale-105 duration-300 text-white py-1 px-4 rounded-full mt-4 group-hover:bg-white group-hover:text-primary"
                    onClick={handleOrderPopup}
                  >
                    More info
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopPrograms;
