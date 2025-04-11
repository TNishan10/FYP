import axios from "axios"; // Using already installed axios
import CLOUDINARY_CONFIG from "../config/cloudinary";

/**
 * Uploads an image directly to Cloudinary via REST API
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} The uploaded image URL
 */
// Add these console logs to better debug the upload process
export const uploadToCloudinary = async (file) => {
  try {
    // Create form data for the upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
    formData.append("folder", CLOUDINARY_CONFIG.folder);

    console.log("Starting Cloudinary upload with config:", {
      cloudName: CLOUDINARY_CONFIG.cloudName,
      uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
      folder: CLOUDINARY_CONFIG.folder,
      fileName: file.name,
      fileSize: file.size,
    });

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Log the complete response for debugging
    console.log("Cloudinary upload complete!", {
      url: response.data.secure_url,
      publicId: response.data.public_id,
      format: response.data.format,
      resourceType: response.data.resource_type,
    });

    // Return the secure URL for the uploaded image
    return response.data.secure_url;
  } catch (error) {
    console.error(
      "Cloudinary upload error details:",
      error.response?.data || error.message
    );
    throw new Error("Failed to upload image to Cloudinary");
  }
};
