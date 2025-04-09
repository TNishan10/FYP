// Use Vite's environment variable syntax instead of process.env
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// You can add other configuration values here
export const APP_NAME = "OX-Fit";
export const UPLOADS_PATH = "/uploads";
export const DEFAULT_IMAGE = "/assets/default-placeholder.png";
