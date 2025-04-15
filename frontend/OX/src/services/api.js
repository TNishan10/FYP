import axios from "axios";
import { API_URL } from "../config";

const token = () =>
  sessionStorage.getItem("token") || localStorage.getItem("token");

const api = {
  // Training Programs API calls
  trainingPrograms: {
    getAll: () => axios.get(`${API_URL}/api/v1/auth/training-programs`),

    getById: (id) =>
      axios.get(`${API_URL}/api/v1/auth/training-programs/${id}`),

    getFeatured: () =>
      axios.get(`${API_URL}/api/v1/auth/training-programs/featured`),

    create: (programData) =>
      axios.post(`${API_URL}/api/v1/auth/training-programs`, programData, {
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json", // Add this line
        },
      }),

    update: (id, programData) =>
      axios.put(`${API_URL}/api/v1/auth/training-programs/${id}`, programData, {
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json", // Add this line
        },
      }),

    delete: (id) =>
      axios.delete(`${API_URL}/api/v1/auth/training-programs/${id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      }),

    generatePdf: (id) =>
      axios.get(`${API_URL}/api/v1/auth/training-programs/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token()}` },
      }),

    download: (id) =>
      axios.post(
        `${API_URL}/api/v1/auth/training-programs/${id}/download`,
        {},
        { headers: { Authorization: `Bearer ${token()}` } }
      ),

    getUserDownloads: () =>
      axios.get(`${API_URL}/api/v1/auth/user/downloads`, {
        headers: { Authorization: `Bearer ${token()}` },
      }),

    setFeatured: (id) =>
      axios.put(
        `${API_URL}/api/v1/auth/training-programs/${id}/set-featured`,
        {},
        { headers: { Authorization: `Bearer ${token()}` } }
      ),
  },
};

export default api;
