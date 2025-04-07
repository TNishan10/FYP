import React, { useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import { Box, Stack, Typography, Alert, CircularProgress } from "@mui/material";

import { exerciseOptions, fetchData } from "../utils/fetchData";
import ExerciseCard from "./ExerciseCard";
import Loader from "./Loader";

const Exercises = ({ exercises, setExercises, bodyPart }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [exercisesPerPage] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExercisesData = async () => {
      setIsLoading(true);
      setError(null);

      // Generate a cache key based on bodyPart
      const cacheKey = `exerciseData_${bodyPart}`;

      // Check localStorage first
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const { data, timestamp } = JSON.parse(cachedData);
          // Cache valid for 7 days
          if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
            console.log(`Using cached exercise data for ${bodyPart}`);
            setExercises(data);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error("Error parsing cached data:", e);
        }
      }

      // If no valid cache, fetch from API
      try {
        let exercisesData = [];
        console.log(`Fetching ${bodyPart} exercises from API...`);

        if (bodyPart === "all") {
          exercisesData = await fetchData(
            "https://exercisedb.p.rapidapi.com/exercises",
            exerciseOptions
          );
        } else {
          exercisesData = await fetchData(
            `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`,
            exerciseOptions
          );
        }

        // Save to localStorage with timestamp
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: exercisesData,
            timestamp: Date.now(),
          })
        );

        setExercises(exercisesData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load exercises. Please try again later.");
        setIsLoading(false);

        // Try to use any cached data even if expired as fallback
        try {
          if (cachedData) {
            const { data } = JSON.parse(cachedData);
            console.log(`Using expired cache as fallback for ${bodyPart}`);
            setExercises(data);
          }
        } catch (e) {
          console.error("Error using expired cache:", e);
        }
      }
    };

    fetchExercisesData();
  }, [bodyPart, setExercises]);

  // Pagination
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = exercises.slice(
    indexOfFirstExercise,
    indexOfLastExercise
  );

  const paginate = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 1800, behavior: "smooth" });
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
        <Typography ml={2} variant="body1">
          Loading exercises...
        </Typography>
      </Box>
    );
  }

  // Show error if present
  if (error && !exercises.length) {
    return (
      <Box mt={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1" align="center">
          Please try again later or contact support if the issue persists.
        </Typography>
      </Box>
    );
  }

  // Show no results message
  if (!isLoading && !currentExercises.length) {
    return (
      <Box mt={4}>
        <Typography variant="h5" align="center" color="textSecondary">
          No exercises found for {bodyPart}.
        </Typography>
      </Box>
    );
  }

  return (
    <Box id="exercises" sx={{ mt: { lg: "109px" } }} mt="50px" p="20px">
      {/* Show warning if using fallback data */}
      {error && exercises.length > 0 && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          Using cached exercise data due to API connectivity issues.
        </Alert>
      )}

      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ fontSize: { lg: "44px", xs: "30px" } }}
        mb="46px"
      >
        Showing Results
      </Typography>
      <Stack
        direction="row"
        sx={{ gap: { lg: "107px", xs: "50px" } }}
        flexWrap="wrap"
        justifyContent="center"
      >
        {currentExercises.map((exercise, idx) => (
          <ExerciseCard key={idx} exercise={exercise} />
        ))}
      </Stack>
      <Stack sx={{ mt: { lg: "114px", xs: "70px" } }} alignItems="center">
        {exercises.length > exercisesPerPage && (
          <Pagination
            color="standard"
            shape="rounded"
            defaultPage={1}
            count={Math.ceil(exercises.length / exercisesPerPage)}
            page={currentPage}
            onChange={paginate}
            size="large"
          />
        )}
      </Stack>
    </Box>
  );
};

export default Exercises;
