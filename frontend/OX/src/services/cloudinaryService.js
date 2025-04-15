import axios from "axios";

// Use your actual cloud name and preset
const CLOUDINARY_URL =
  import.meta.env.VITE_CLOUDINARY_URL ||
  "https://api.cloudinary.com/v1_1/dywgqhmpo/upload";

// Change this to match your actual preset name "OX-Fit"
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "OX-Fit";

export const uploadImage = async (file) => {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    console.log("Uploading to:", CLOUDINARY_URL);
    console.log("Using preset:", UPLOAD_PRESET);

    const response = await axios.post(CLOUDINARY_URL, formData);

    if (response.data && response.data.secure_url) {
      return response.data.secure_url;
    } else {
      throw new Error("Upload successful but no URL returned");
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    console.error("Response details:", error.response?.data);
    throw error;
  }
};

export default { uploadImage };
