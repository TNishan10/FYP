import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Skeleton,
  Divider,
} from "@mui/material";
import { exerciseOptions, fetchData, youtubeOptions } from "../utils/fetchData";
import Detail from "../components/Details/Detail";
import ExerciseVideos from "../components/ExerciseVideos/ExerciseVideos";
import SimilarExercises from "../components/SimilarExercises/SimilarExercises";

const ExerciseDetail = () => {
  const [exerciseDetail, setExerciseDetail] = useState({});
  const [exerciseVideos, setExerciseVideos] = useState([]);
  const [targetMuscleExercises, setTargetMuscleExercises] = useState([]);
  const [equipmentExercises, setEquipmentExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsLoading(true);

    const fetchExercisesData = async () => {
      const exerciseDbUrl = "https://exercisedb.p.rapidapi.com";
      const youtubeSearchUrl =
        "https://youtube-search-and-download.p.rapidapi.com";

      try {
        // Fetch exercise details
        const exerciseDetailData = await fetchData(
          `${exerciseDbUrl}/exercises/exercise/${id}`,
          exerciseOptions
        );
        setExerciseDetail(exerciseDetailData);

        // Fetch YouTube videos related to the exercise
        const exerciseVideosData = await fetchData(
          `${youtubeSearchUrl}/search?query=${exerciseDetailData.name} exercise`,
          youtubeOptions
        );
        setExerciseVideos(exerciseVideosData.contents);

        // Fetch exercises targeting the same muscle group
        const targetMuscleExercisesData = await fetchData(
          `${exerciseDbUrl}/exercises/target/${exerciseDetailData.target}`,
          exerciseOptions
        );
        setTargetMuscleExercises(targetMuscleExercisesData);

        // Fetch exercises using the same equipment
        const equipmentExercisesData = await fetchData(
          `${exerciseDbUrl}/exercises/equipment/${exerciseDetailData.equipment}`,
          exerciseOptions
        );
        setEquipmentExercises(equipmentExercisesData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchExercisesData();
  }, [id]);

  // Loading skeleton
  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: { lg: "96px", xs: "60px" }, px: 2 }}>
          <Skeleton
            variant="rectangular"
            height={300}
            sx={{ borderRadius: 2, mb: 3 }}
          />
          <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} md={6} lg={3} key={item}>
                <Skeleton
                  variant="rectangular"
                  height={200}
                  sx={{ borderRadius: 2 }}
                />
                <Skeleton variant="text" height={20} sx={{ mt: 1 }} />
                <Skeleton variant="text" height={20} width="60%" />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    );
  }

  // No data state
  if (!exerciseDetail)
    return (
      <Container maxWidth="lg">
        <Box
          sx={{ mt: { lg: "96px", xs: "60px" }, textAlign: "center", py: 5 }}
        >
          <Typography variant="h4" color="text.secondary">
            No Exercise Data Available
          </Typography>
        </Box>
      </Container>
    );

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          mt: { lg: "96px", xs: "60px" },
          px: { xs: 1, sm: 3 },
          mb: 8,
          bgcolor: "background.default",
        }}
      >
        {/* Exercise detail section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 4 },
            mb: 5,
            borderRadius: 2,
            boxShadow: "0 3px 15px rgba(0,0,0,0.07)",
            overflow: "hidden",
          }}
        >
          <Detail exerciseDetail={exerciseDetail} />
        </Paper>

        {/* Exercise Videos Section with Grid */}
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              mb: 3,
              pb: 1,
              fontWeight: "bold",
              borderBottom: "2px solid",
              borderColor: "primary.main",
              display: "inline-block",
            }}
          >
            Watch{" "}
            <Typography
              component="span"
              color="primary.main"
              variant="h4"
              fontWeight="bold"
            >
              {exerciseDetail.name}
            </Typography>{" "}
            Videos
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 2,
              boxShadow: "0 3px 15px rgba(0,0,0,0.07)",
            }}
          >
            {/* Here I'm keeping the ExerciseVideos component, but you may want to modify it to use a grid layout */}
            <ExerciseVideos
              exerciseVideos={exerciseVideos}
              name={exerciseDetail.name}
            />
          </Paper>
        </Box>

        {/* Similar Exercises Section with Grid */}
        <Box>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              mb: 3,
              pb: 1,
              fontWeight: "bold",
              borderBottom: "2px solid",
              borderColor: "primary.main",
              display: "inline-block",
            }}
          >
            Similar Exercises
          </Typography>

          <Grid container spacing={3}>
            {/* Target Muscle Exercises */}
            <Grid item xs={12} lg={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 2,
                  height: "100%",
                  boxShadow: "0 3px 15px rgba(0,0,0,0.07)",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ mb: 2, fontWeight: "medium", color: "text.secondary" }}
                >
                  Exercises for the same muscle group
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box
                  className="similar-exercises-grid"
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(2, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  <SimilarExercises
                    targetMuscleExercises={targetMuscleExercises}
                    equipmentExercises={[]} // Pass empty array to only render target exercises here
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Equipment Exercises */}
            <Grid item xs={12} lg={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 2,
                  height: "100%",
                  boxShadow: "0 3px 15px rgba(0,0,0,0.07)",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ mb: 2, fontWeight: "medium", color: "text.secondary" }}
                >
                  Exercises using the same equipment
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box
                  className="similar-exercises-grid"
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(2, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  <SimilarExercises
                    targetMuscleExercises={[]} // Pass empty array to only render equipment exercises here
                    equipmentExercises={equipmentExercises}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default ExerciseDetail;
