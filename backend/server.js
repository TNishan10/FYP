import fs from "fs";
import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import pkg from "pg";
import authRoutes from "./routes/authRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import { scheduleUserCleanup } from "./utility/scheduledTask.js";
// Configure env
dotenv.config();

// Setup __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  console.log(`Creating uploads directory at ${uploadsDir}`);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database
const { Client } = pkg;
const con = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "nishan",
  database: "OX-Fit",
});

con
  .connect()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.log(err);
  });

// Rest object
const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// File upload middleware with enhanced configuration
app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    createParentPath: true,
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"), // Use a local temp directory
    debug: true, // Enable debugging
  })
);
// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", authRoutes);

// Rest API
app.get("/", (req, res) => {
  res.send({
    message: "Welcome to OX-Fit",
  });
});

// Port
const port = process.env.PORT || 8000;

// Schedule user cleanup task
scheduleUserCleanup();

// Run listen
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});

export default con;
