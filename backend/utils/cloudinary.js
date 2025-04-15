import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";

// Configure dotenv
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dywgqhmpo",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image to Cloudinary
 * @param {string} imageString - Base64 encoded image or image URL
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<Object>} - Cloudinary upload response
 */
export const uploadImage = async (
  imageString,
  folder = "training-programs"
) => {
  try {
    const result = await cloudinary.uploader.upload(imageString, {
      folder: folder,
      resource_type: "auto",
    });
    return result;
  } catch (error) {
    console.error("Error uploading to cloudinary:", error);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Cloudinary deletion response
 */
export const deleteImage = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from cloudinary:", error);
    throw error;
  }
};

export default { uploadImage, deleteImage, cloudinary };
