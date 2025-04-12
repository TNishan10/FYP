import axios from "axios";
import { message } from "antd";
import { API_URL } from "../config";

// Fetch all training programs
export const fetchTrainingPrograms = async () => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      message.error("You must be logged in to access this page");
      return { success: false, data: [] };
    }

    const response = await axios.get(
      `${API_URL}/api/v1/auth/training-programs`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data && response.data.success) {
      return { success: true, data: response.data.data || [] };
    } else {
      message.error("Failed to fetch training programs");
      return { success: false, data: [] };
    }
  } catch (error) {
    console.error("Error fetching programs:", error);
    message.error("Failed to fetch training programs");
    return { success: false, data: [] };
  }
};

// Create new training program
export const createTrainingProgram = async (formData) => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      message.error("You must be logged in to perform this action");
      return { success: false };
    }

    const response = await axios.post(
      `${API_URL}/api/v1/auth/training-programs`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.status === 200 || response.status === 201) {
      message.success("Training program created successfully");
      return { success: true, data: response.data };
    }

    return { success: false };
  } catch (error) {
    console.error("Error creating program:", error);
    message.error("Failed to create training program");
    return { success: false };
  }
};

// Update existing training program
export const updateTrainingProgram = async (programId, formData) => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      message.error("You must be logged in to perform this action");
      return { success: false };
    }

    const response = await axios.put(
      `${API_URL}/api/v1/auth/training-programs/${programId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.status === 200) {
      message.success("Training program updated successfully");
      return { success: true, data: response.data };
    }

    return { success: false };
  } catch (error) {
    console.error("Error updating program:", error);
    message.error("Failed to update training program");
    return { success: false };
  }
};

// Delete a training program
export const deleteTrainingProgram = async (programId) => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      message.error("Authentication failed. Please login again.");
      return { success: false };
    }

    const response = await axios.delete(
      `${API_URL}/api/v1/auth/training-programs/${programId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 200) {
      message.success("Program deleted successfully");
      return { success: true };
    }

    return { success: false };
  } catch (error) {
    console.error("Delete failed with error:", error);
    message.error("Failed to delete program");
    return { success: false };
  }
};
