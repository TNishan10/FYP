// Define options for ExerciseDB API
export const exerciseOptions = {
  method: "GET",
  headers: {
    "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
    "X-RapidAPI-Key": "c59069163cmsh56acfb47fa67935p1d783fjsnf66212a43d33",
  },
};

// Define options for YouTube Search API
export const youtubeOptions = {
  method: "GET",
  headers: {
    "X-RapidAPI-Host": "youtube-search-and-download.p.rapidapi.com",
    "X-RapidAPI-Key": "f0f02122ebmsh4acf126c9a5cc4cp126f78jsn765fb7a044ae",
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
