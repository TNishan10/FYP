import React from "react";
import { fetchData } from "../utils/fetchData";
import { useNavigate } from "react-router-dom";
import { exerciseOptions } from "../utils/fetchData";
import { useEffect, useState } from "react";

const Exercise = () => {
  const [exerciseDetail, setExerciseDetail] = useState([]);
  const navigate = useNavigate();
  const fetchExercisesData = async () => {
    const exerciseDbUrl = "https://exercisedb.p.rapidapi.com";
    try {
      const exerciseDetailData = await fetchData(
        `${exerciseDbUrl}/exercises?limit=100&offset=0`,
        exerciseOptions
      );
      setExerciseDetail(exerciseDetailData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchExercisesData();
  }, []);
  return (
    <div>
      <h1>List of Exercises</h1>
      <main className=" grid grid-cols-3 w-full gap-4">
        {exerciseDetail?.map((exercise) => (
          <div
            onClick={() => navigate(`/exercises/${exercise.id}`)}
            key={exercise.id}
            className=" cursor-pointer border border-1 border-gray-300 rounded-md p-2 mt-4"
          >
            <img
              src={exercise?.gifUrl}
              loading="lazy"
              className="detail-image"
              alt={exercise?.name}
            />
            <p>{exercise.name}</p>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Exercise;
