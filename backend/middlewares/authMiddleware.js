import JWT from "jsonwebtoken";
import con from "../server.js";
import { body, validationResult } from "express-validator";

export const requireSignIn = async (req, res, next) => {
  try {
    // Get token from various sources
    const token =
      req.cookies.token ||
      req.headers.authorization?.split(" ")[1] ||
      req.headers["x-access-token"];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    // Verify token
    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    // Add user data to request
    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed. Invalid or expired token.",
    });
  }
};

// Middleware to check if user is admin
export const isAdmin = async (req, res, next) => {
  try {
    // The field might be id or user_id depending on how your token is structured
    const userId = req.user.id || req.user.user_id;

    if (!userId) {
      return res.status(401).send({
        success: false,
        message: "Invalid user information",
      });
    }

    // Query to check user role - modify if your column name is different
    const query = "SELECT user_role FROM users WHERE user_id = $1";
    const result = await con.query(query, [userId]);

    // Debug info
    console.log("Admin check result:", result.rows);

    if (!result.rows.length || result.rows[0].user_role !== "admin") {
      return res.status(403).send({
        // Changed to 403 Forbidden which is more appropriate
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    console.log("Admin middleware error:", error);
    return res.status(500).send({
      success: false,
      message: "Error in admin middleware",
      error: error.message, // Include error message for debugging
    });
  }
};

// Validation middleware for exercise entries
export const validateExerciseEntry = [
  // Required fields validation
  body("name").notEmpty().withMessage("Exercise name is required"),
  body("muscle_group").notEmpty().withMessage("Muscle group is required"),

  // Set/rep ranges validation (for strength exercises)
  body("sets")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Sets must be between 1 and 20"),
  body("reps")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("Reps must be between 1 and 200"),

  // Weight validation
  body("weight")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Weight must be a positive number"),

  // Process validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];
