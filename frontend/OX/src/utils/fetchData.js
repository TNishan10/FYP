// Define options for ExerciseDB API
export const exerciseOptions = {
  method: "GET",
  headers: {
    "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
    "X-RapidAPI-Key": "ccd3b13af8msh7248c23e9c7bb03p1a1553jsnf9f7921c7bcb",
  },
};

// Define options for YouTube Search API
export const youtubeOptions = {
  method: "GET",
  headers: {
    "X-RapidAPI-Host": "youtube-search-and-download.p.rapidapi.com",
    "X-RapidAPI-Key": "f0021db587msh781fb1cbef39856p11c183jsn45521d5d1c85",
  },
};

// Utility function to fetch data
export const fetchData = async (url, options) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const data = await res.json();
  return data;
};

// Function to fetch exercise details
export const fetchExercisesData = async (id) => {
  const exerciseDbUrl = "https://exercisedb.p.rapidapi.com";
  const youtubeSearchUrl = "https://youtube-search-and-download.p.rapidapi.com";

  try {
    // Fetch exercise details
    const exerciseDetailData = await fetchData(
      `${exerciseDbUrl}/exercises/exercise/${id}`,
      exerciseOptions
    );
    // console.log("Exercise Detail Data:", exerciseDetailData);

    // Fetch YouTube videos related to the exercise
    const exerciseVideosData = await fetchData(
      `${youtubeSearchUrl}/search?query=${exerciseDetailData.name} exercise`,
      youtubeOptions
    );
    // console.log("Exercise Videos Data:", exerciseVideosData);

    // Fetch exercises targeting the same muscle group
    const targetMuscleExercisesData = await fetchData(
      `${exerciseDbUrl}/exercises/target/${exerciseDetailData.target}`,
      exerciseOptions
    );
    // console.log("Target Muscle Exercises Data:", targetMuscleExercisesData);

    // Fetch exercises using the same equipment
    const equipmentExercisesData = await fetchData(
      `${exerciseDbUrl}/exercises/equipment/${exerciseDetailData.equipment}`,
      exerciseOptions
    );
    // console.log("Equipment Exercises Data:", equipmentExercisesData);

    // Return all fetched data (optional)
    return {
      exerciseDetail: exerciseDetailData,
      exerciseVideos: exerciseVideosData,
      targetMuscleExercises: targetMuscleExercisesData,
      equipmentExercises: equipmentExercisesData,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// Example usage
const exerciseId = "0001"; // Replace with a valid exercise ID
fetchExercisesData(exerciseId)
  .then((data) => {
    // console.log("Fetched Data:", data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
