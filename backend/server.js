import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import pkg from "pg";
import authRoutes from "./routes/authRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";

// Configure env
dotenv.config();

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
app.use(express.json());
app.use(morgan("dev"));

// CORS configuration - Fixed for credentials
app.use(
  cors({
    origin: "http://localhost:5173", //  frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// If you don't have express-fileupload already, add this too
import fileUpload from "express-fileupload";
app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  })
);

// Make sure your body parser limit is increased
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());

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

// Run listen
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});

export default con;
