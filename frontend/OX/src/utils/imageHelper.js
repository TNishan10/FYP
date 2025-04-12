import { API_URL } from "../config";

// Helper function for image URLs - Process URLs before display
export const getFullImageUrl = (url) => {
  // Check for null, undefined, empty string, or the literal string "undefined"
  if (!url || url === "undefined") {
    console.log("Invalid URL detected:", url);
    return null;
  }

  console.log("Processing URL:", url);

  // If it's already a full URL, return it
  if (url.startsWith("http")) {
    console.log("URL is already absolute:", url);
    return url;
  }

  // If it's a relative URL (starts with slash), prepend API_URL
  if (url.startsWith("/")) {
    const fullUrl = `${API_URL}${url}`;
    console.log("Created full URL from relative path:", fullUrl);
    return fullUrl;
  }

  // If it's a base64 data URL, return as is
  if (url.startsWith("data:")) {
    console.log("URL is a data URL");
    return url;
  }

  // Default case - try to make it a full URL
  const fullUrl = `${API_URL}/${url.replace(/^\//, "")}`;
  console.log("Created full URL (default case):", fullUrl);
  return fullUrl;
};
