import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import fallbackImg from "../../assets/trainers/t1.jpeg";
import { useAuth } from "../../contexts/AuthContext"; // Make sure this path is correct

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/auth/training-programs"
        );

        if (response.data.success) {
          // Get first 5 programs
          setPrograms(response.data.data.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleProgramClick = (programId) => {
    if (isAuthenticated()) {
      // If authenticated, navigate to the program details
      navigate(`/programs/${programId}`);
    } else {
      // If not authenticated, redirect to login page with return URL
      navigate("/login", { state: { from: `/programs/${programId}` } });
    }
  };

  const handleViewAllClick = (e) => {
    if (!isAuthenticated()) {
      e.preventDefault();
      navigate("/login", { state: { from: "/programs" } });
    }
  };

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
            Professional training programs designed to help you achieve your
            fitness goals
          </p>
        </div>
        {/** Body section */}
        <div>
          {loading ? (
            <div className="text-center py-10">Loading programs...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 place-items-center gap-5">
              {programs.map((program, index) => (
                <div
                  data-aos="fade-up"
                  data-aos-delay={index * 200}
                  key={program.program_id}
                  className="space-y-3 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleProgramClick(program.program_id)}
                >
                  <img
                    src={program.image_url || fallbackImg}
                    alt={program.title}
                    className="h-[220px] w-[150px] object-cover rounded-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackImg;
                    }}
                  />
                  <div>
                    <h3 className="font-semibold">{program.title}</h3>
                    <p className="text-sm text-gray-600">{program.goal_type}</p>
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      <span>{(Math.random() * (5 - 4) + 4).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* View all button */}
          <div className="flex justify-center">
            {isAuthenticated() ? (
              <Link to="/programs">
                <button className="text-center mt-10 cursor-pointer bg-primary text-white py-1 px-5 rounded-md">
                  View all Programs
                </button>
              </Link>
            ) : (
              <button
                className="text-center mt-10 cursor-pointer bg-primary text-white py-1 px-5 rounded-md"
                onClick={handleViewAllClick}
              >
                View all Programs
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Programs;
