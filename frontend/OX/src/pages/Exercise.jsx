import React, { useState, useEffect } from "react";
import { fetchData, exerciseOptions } from "../utils/fetchData";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import "./pagination.css";

const Exercise = () => {
  const [exerciseDetail, setExerciseDetail] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const exercisesPerPage = 12; // Adjust as needed
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExercisesData = async () => {
    setIsLoading(true);
    setError(null);

    // First check localStorage for cached data
    const cachedData = localStorage.getItem("exerciseData");
    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData);
        const oneDay = 24 * 60 * 60 * 1000; // 24 hours
        if (Date.now() - timestamp < oneDay) {
          console.log("Using cached exercise data");
          setExerciseDetail(data);
          setFilteredExercises(data);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error("Error parsing cached data:", e);
        // Continue with API fetch if cache is invalid
      }
    }

    const exerciseDbUrl = "https://exercisedb.p.rapidapi.com";
    let retries = 3;
    let delay = 2000; // Start with 2 seconds

    while (retries > 0) {
      try {
        // Reduce request size to minimize rate limiting chances
        const exerciseDetailData = await fetchData(
          `${exerciseDbUrl}/exercises?limit=300&offset=0`, // Reduced from 1000
          exerciseOptions
        );

        // Store in localStorage with timestamp
        localStorage.setItem(
          "exerciseData",
          JSON.stringify({
            data: exerciseDetailData,
            timestamp: Date.now(),
          })
        );

        setExerciseDetail(exerciseDetailData);
        setFilteredExercises(exerciseDetailData);
        setIsLoading(false);
        return; // Success, exit function
      } catch (error) {
        console.log("Error details:", error);

        // More robust error status checking
        const status =
          error.status ||
          (error.response && error.response.status) ||
          (error.message && error.message.includes("429") ? 429 : null);

        if (status === 429 && retries > 0) {
          console.log(
            `Rate limited, waiting ${
              delay / 1000
            } seconds... (${retries} retries left)`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          retries--;
          delay *= 2; // Double the delay for next attempt
        } else {
          console.error("Error fetching data:", error);
          setError("Unable to load exercises. Please try again later.");

          // Try to use cached data even if it's old as a fallback
          const oldCache = localStorage.getItem("exerciseData");
          if (oldCache) {
            try {
              const { data } = JSON.parse(oldCache);
              console.log("Using old cached data as fallback");
              setExerciseDetail(data);
              setFilteredExercises(data);
            } catch (e) {
              console.error("Error parsing old cached data:", e);
            }
          }

          setIsLoading(false);
          break;
        }
      }
    }

    // If we've exhausted all retries
    if (retries === 0) {
      setError("Service temporarily unavailable. Please try again later.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExercisesData();
  }, []);

  useEffect(() => {
    // Filter exercises based on search term
    const filtered = exerciseDetail.filter((exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredExercises(filtered);
    setCurrentPage(0); // Reset to first page when search term changes
  }, [searchTerm, exerciseDetail]);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const offset = currentPage * exercisesPerPage;
  const currentExercises = filteredExercises.slice(
    offset,
    offset + exercisesPerPage
  );
  const pageCount = Math.ceil(filteredExercises.length / exercisesPerPage);

  const handleRetry = () => {
    fetchExercisesData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Exercise Library
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover a comprehensive collection of exercises to enhance your
          fitness journey
        </p>
      </div>

      {/* Styled Search Bar */}
      <div className="relative max-w-3xl mx-auto mb-10">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search for an exercise..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-full shadow-sm 
                     focus:ring-4 focus:ring-blue-100 focus:border-blue-500 
                     transition-all duration-300 ease-in-out
                     text-gray-700 bg-white outline-none text-lg"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading exercises...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-red-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-gray-600 text-xl mb-2">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {!isLoading && !error && filteredExercises.length === 0 ? (
        <div className="text-center py-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M12 20h9a2 2 0 002-2V6a2 2 0 00-2-2h-9a2 2 0 00-2 2v12a2 2 0 002 2zm0 0h-3a2 2 0 01-2-2v-9a2 2 0 012-2h3a2 2 0 012 2v9a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-600 text-xl mb-2">No exercises found</p>
          <p className="text-gray-500">Try a different search term</p>
        </div>
      ) : !isLoading && !error ? (
        <>
          <div className="mb-6 text-right">
            <p className="text-gray-600">
              Showing {currentExercises.length} of {filteredExercises.length}{" "}
              exercises
            </p>
          </div>

          <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {currentExercises?.map((exercise) => (
              <div
                onClick={() => navigate(`/exercises/${exercise.id}`)}
                key={exercise.id}
                className="flex flex-col h-full cursor-pointer rounded-xl overflow-hidden bg-white 
                           shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="p-2 bg-gray-50">
                  <img
                    src={exercise?.gifUrl}
                    loading="lazy"
                    className="w-full h-48 object-cover rounded-lg"
                    alt={exercise?.name}
                  />
                </div>
                <div className="p-4 flex-grow">
                  <h3 className="font-medium text-gray-800 capitalize text-lg">
                    {exercise.name}
                  </h3>
                  <div className="flex items-center mt-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">
                      {exercise.bodyPart}
                    </span>
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full capitalize">
                      {exercise.target}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </main>
        </>
      ) : null}

      {!isLoading && !error && filteredExercises.length > 0 && (
        <div className="mt-8 mb-6">
          <ReactPaginate
            previousLabel={
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>{" "}
                Previous
              </span>
            }
            nextLabel={
              <span className="flex items-center">
                Next{" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            }
            pageCount={pageCount}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            previousLinkClassName={"pagination__link"}
            nextLinkClassName={"pagination__link"}
            disabledClassName={"pagination__link--disabled"}
            activeClassName={"pagination__link--active"}
            pageClassName={"pagination__link"}
            breakClassName={"pagination__link"}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            initialPage={0}
          />
        </div>
      )}
    </div>
  );
};

export default Exercise;
