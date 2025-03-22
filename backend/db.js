import pg from "pg";
import dotenv from "dotenv";
import path from "path";

// Configure dotenv
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const { Pool } = pg;

// Create connection pool
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "oxfit",
  password: process.env.DB_PASSWORD || "postgres",
  port: parseInt(process.env.DB_PORT || "5432"),
});

// Test connection once
pool
  .connect()
  .then((client) => {
    console.log("Database connected successfully! Connection pool");
    client.release();
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
    process.exit(1);
  });

export default pool;
