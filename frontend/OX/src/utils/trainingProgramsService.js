import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const CLOUDINARY_URL =
  import.meta.env.VITE_CLOUDINARY_URL ||
  "https://api.cloudinary.com/v1_1/your-cloud-name/upload";
const UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ox-fit-uploads";

/**
 * Uploads an image to Cloudinary
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export const uploadImage = async (file) => {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await axios.post(CLOUDINARY_URL, formData);

    if (response.data && response.data.secure_url) {
      return response.data.secure_url;
    } else {
      throw new Error("Failed to upload image");
    }
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};

/**
 * Create a new empty exercise object with a unique ID
 * @returns {Object} - New exercise object
 */
export const createNewExercise = () => {
  return {
    id: uuidv4(), // Generate unique ID for frontend management
    movement: "",
    intensity: "",
    weight_used: "",
    actual_rpe: "",
    sets: null,
    reps: null,
    tempo: "",
    rest: "",
    notes: "",
  };
};

/**
 * Format exercises from frontend format to backend format
 * @param {Array} exercises - Array of exercise objects from the form
 * @returns {Array} - Formatted exercises for backend
 */
export const formatExercisesForBackend = (exercises) => {
  return exercises
    .map((exercise) => {
      // Filter out empty fields and the frontend-only id
      const { id, ...data } = exercise;

      // Convert numeric strings to numbers where appropriate
      return {
        movement: data.movement,
        intensity: data.intensity || null,
        weight_used: data.weight_used || null,
        actual_rpe: data.actual_rpe || null,
        sets: Number(data.sets) || null,
        reps: Number(data.reps) || null,
        tempo: data.tempo || null,
        rest: data.rest || null,
        notes: data.notes || null,
      };
    })
    .filter((ex) => ex.movement); // Only include exercises with at least a movement name
};

/**
 * Format exercises from backend format to frontend format
 * @param {Array} exercises - Array of exercise objects from the backend
 * @returns {Array} - Formatted exercises for frontend form
 */
export const formatExercisesForFrontend = (exercises) => {
  if (!exercises || !Array.isArray(exercises)) return [createNewExercise()];

  return exercises.map((exercise) => ({
    id: exercise.exercise_id || uuidv4(),
    movement: exercise.movement || "",
    intensity: exercise.intensity || "",
    weight_used: exercise.weight_used || "",
    actual_rpe: exercise.actual_rpe || "",
    sets: exercise.sets || null,
    reps: exercise.reps || null,
    tempo: exercise.tempo || "",
    rest: exercise.rest || "",
    notes: exercise.notes || "",
  }));
};

/**
 * Validate exercise data
 * @param {Array} exercises - Array of exercise objects
 * @returns {boolean} - Whether the exercises are valid
 */
export const validateExercises = (exercises) => {
  if (!exercises || exercises.length === 0) return false;

  return exercises.every(
    (ex) => ex.movement && ex.sets !== null && ex.reps !== null
  );
};

export default {
  uploadImage,
  createNewExercise,
  formatExercisesForBackend,
  formatExercisesForFrontend,
  validateExercises,
};
