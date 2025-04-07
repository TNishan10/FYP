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

  const fetchExercisesData = async () => {
    const exerciseDbUrl = "https://exercisedb.p.rapidapi.com";
    try {
      const exerciseDetailData = await fetchData(
        `${exerciseDbUrl}/exercises?limit=1000&offset=0`, // Fetch all exercises initially
        exerciseOptions
      );
      setExerciseDetail(exerciseDetailData);
      setFilteredExercises(exerciseDetailData); // Initialize filtered exercises with all exercises
    } catch (error) {
      console.error("Error fetching data:", error);
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

      {filteredExercises.length === 0 ? (
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
      ) : (
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
      )}

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
    </div>
  );
};

export default Exercise;
