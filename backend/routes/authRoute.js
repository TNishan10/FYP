import express from "express";

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  cleanupInactiveUsers,
  getUserByEmail,
  verifyUser,
  createUserByAdmin,
  updateUserByAdmin,
  softDeleteUser,
} from "../controllers/UsersController.js";

import {
  registerController,
  loginController,
  verifyEmail,
  resendVerification,
  verifyCode,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import {
  getHealthConditionController,
  getHealthConditionByIdController,
  createHealthConditionController,
  updateHealthConditionController,
  deleteHealthConditionController,
} from "../controllers/HealthConditionController.js";

// Import User Health Condition controller functions
import {
  getAllUserHealthConditions,
  getUserHealthConditions,
  getUsersByHealthCondition,
  getUserHealthConditionById,
  addUserHealthCondition,
  removeUserHealthCondition,
  updateUserHealthConditions,
} from "../controllers/UserHealthCondition.js";

import {
  getAllUserInfo,
  getUserInfoById,
  getUserInfoByUserId,
  createUserInfo,
  updateUserInfo,
  deleteUserInfo,
  deleteUserInfoByUserId,
} from "../controllers/UserInfoController.js";

import {
  getSupplementController,
  getSupplementByIdController,
  createSupplementController,
  updateSupplementController,
  deleteSupplementController,
} from "../controllers/SupplementController.js";

import {
  getPlanController,
  createPlanController,
} from "../controllers/PlanController.js";

import {
  getUserNotesController,
  createUserNotesController,
} from "../controllers/UserNotesController.js";

import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
// Add these new imports for email verification testing
import { sendVerificationEmail } from "../utility/emailService.js";
// import {
//   forgotPassword,
//   verifyResetOTP,
//   resetPassword,
// } from "../controllers/passwordResetController.js";

import {
  searchFoods,
  getDailyFoodLog,
  addFood,
  addFoodToLog,
  removeFoodFromLog,
} from "../controllers/NutritionController.js";

import {
  getWeightHistory,
  addWeightEntry,
  deleteWeightEntry,
} from "../controllers/WeightController.js";

import {
  getExercises,
  getMuscleGroups,
  getUserExerciseLogs,
  logExercise,
  removeExerciseLog,
} from "../controllers/ExerciseController.js";

import {
  getAllTrainingPrograms,
  getTrainingProgramById,
  createTrainingProgram,
  updateTrainingProgram,
  deleteTrainingProgram,
  getFeaturedProgram,
  setFeaturedProgram,
  generateProgramPdf,
  recordProgramDownload,
  getUserDownloads,
} from "../controllers/TrainingProgramController.js";

import { uploadImage } from "../utils/cloudinary.js";

import crypto from "crypto";
import con from "../server.js";

//router object
const router = express.Router();

// User Routes
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.get("/users/email/:email", getUserByEmail);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.post("/users/cleanup-inactive", isAdmin, cleanupInactiveUsers);
router.post("/users/cleanup-test", cleanupInactiveUsers);
router.post("/verify", verifyUser);
router.post("/users/admin/create", createUserByAdmin);
router.put("/users/:id", updateUserByAdmin);
router.put("/users/:id/deactivate", softDeleteUser);

// Public Routes
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Email verification testing routes

// Test sending an email manually
router.post("/test-email", async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({
        success: false,
        message: "Email and token are required",
      });
    }

    console.log(`Test email request received for ${email} with token ${token}`);
    const result = await sendVerificationEmail(email, token);

    if (result) {
      res.status(200).json({
        success: true,
        message: `Test email sent successfully to ${email}`,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send test email",
      });
    }
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending test email",
      error: error.message,
    });
  }
});

// Get verification token for a specific email
router.get("/get-token/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const result = await con.query(
      "SELECT verification_token FROM users WHERE user_email = $1 AND verification_token IS NOT NULL",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No verification token found for this email",
      });
    }

    res.status(200).json({
      success: true,
      email: email,
      token: result.rows[0].verification_token,
    });
  } catch (error) {
    console.error("Error getting token:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving token",
      error: error.message,
    });
  }
});

// Generate a new test token for an email
router.get("/generate-test-token/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const testToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);

    const updateResult = await con.query(
      "UPDATE users SET verification_token = $1, token_expires_at = $2, is_verified = false WHERE user_email = $3 RETURNING user_email",
      [testToken, tokenExpiresAt, email]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User with this email not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Test token generated",
      email,
      token: testToken,
    });
  } catch (error) {
    console.error("Error generating test token:", error);
    res.status(500).json({
      success: false,
      message: "Error generating test token",
      error: error.message,
    });
  }
});

// Check verification status for currently logged in user
router.get("/check-verification", requireSignIn, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await con.query(
      "SELECT is_verified FROM users WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      verified: result.rows[0].is_verified || false,
    });
  } catch (error) {
    console.error("Error checking verification:", error);
    res.status(500).json({
      success: false,
      message: "Error checking verification status",
      error: error.message,
    });
  }
});

// router.post("/forgot-password", forgotPassword);
// router.post("/verify-otp", verifyResetOTP);
// router.post("/reset-password", resetPassword);

// // Protected Routes
// router.get("/healthcondition", requireSignIn, UserHealthCondition);
// router.get("/supplement", requireSignIn, getSupplementController);

//unprotected routes
router.get("/supplement", getSupplementController);
router.get("/supplement/:id", getSupplementByIdController);
router.post("/supplement", requireSignIn, isAdmin, createSupplementController);
router.put("/supplement/:id", updateSupplementController);
router.delete("/supplement/:id", deleteSupplementController);
// // Plan routes - protected
// router.get("/plans", requireSignIn, getPlanController);
// router.post("/plans", requireSignIn, createPlanController);

//unportected routes
router.get("/plans", getPlanController);
router.post("/plans", createPlanController);

//user notes
router.get("/usernotes", getUserNotesController);
router.post("/usernotes", createUserNotesController);
// Add this to your authRoute.js routes
router.post("/verify-code", verifyCode);

router.get("/user-info", getAllUserInfo);
router.get("/user-info/:id", getUserInfoById);
router.get("/users/:user_id/info", getUserInfoByUserId);
router.post("/user-info", createUserInfo);
router.put("/user-info/:id", updateUserInfo);
router.delete("/user-info/:id", deleteUserInfo);
router.delete("/users/:user_id/info", deleteUserInfoByUserId);

// Health Condition Routes
router.get("/health-conditions", getHealthConditionController);
router.get("/health-conditions/:id", getHealthConditionByIdController);
router.post("/health-conditions", createHealthConditionController);
router.put("/health-conditions/:id", updateHealthConditionController);
router.delete("/health-conditions/:id", deleteHealthConditionController);

// User Health Condition routes
router.get("/user-health", getAllUserHealthConditions); // GET all
router.get("/users/:user_id/health-conditions", getUserHealthConditions); // GET by user_id
router.get("/health-conditions/:condition_id/users", getUsersByHealthCondition); // GET by condition_id
router.get(
  "/users/:user_id/health-conditions/:condition_id",
  getUserHealthConditionById
); // GET by both IDs
router.post("/user-health", addUserHealthCondition); // POST new association
router.put("/users/:user_id/health-conditions", updateUserHealthConditions); // PUT (update)
router.delete(
  "/users/:user_id/health-conditions/:condition_id",
  removeUserHealthCondition
);

// Nutrition Routes
router.get("/nutrition/foods/search", searchFoods);
router.get("/nutrition/daily-log/:userId", requireSignIn, getDailyFoodLog);
router.post("/nutrition/daily-log/:userId/add", requireSignIn, addFoodToLog); // Added requireSignIn middleware
router.post("/nutrition/foods/add", requireSignIn, addFood);
router.delete(
  "/nutrition/daily-log/:userId/remove/:logId",
  requireSignIn,
  removeFoodFromLog
);
// Weight Tracking Routes
router.get("/progress/weight/:userId", getWeightHistory);
router.post("/progress/weight/:userId/add", addWeightEntry);
router.delete("/progress/weight/:userId/:weightId", deleteWeightEntry);

// Exercise Tracking Routes
router.get("/exercises/list", getExercises);
router.get("/exercises/muscle-groups", getMuscleGroups);
router.get("/exercises/user/:userId", getUserExerciseLogs);
router.post("/exercises/log/:userId", logExercise);
router.delete("/exercises/log/:userId/remove/:logId", removeExerciseLog);

// Public training program routes
router.get("/training-programs", getAllTrainingPrograms);
router.get("/training-programs/featured", getFeaturedProgram);

router.get("/training-programs/:id", getTrainingProgramById);
router.get("/training-programs/:id/pdf", generateProgramPdf);

// Protected training program routes (require signin)
router.post(
  "/training-programs/:id/download",
  requireSignIn,
  recordProgramDownload
);
router.get("/user/downloads", requireSignIn, getUserDownloads);

// Admin training program routes
router.post(
  "/training-programs",
  requireSignIn,
  isAdmin,
  createTrainingProgram
);
router.put(
  "/training-programs/:id",
  requireSignIn,
  isAdmin,
  updateTrainingProgram
);
router.delete(
  "/training-programs/:id",
  requireSignIn,
  isAdmin,
  deleteTrainingProgram
);
router.put(
  "/training-programs/:id/set-featured",
  requireSignIn,
  isAdmin,
  setFeaturedProgram
);

// Then add this route with your other routes
router.post("/upload-image", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "No image provided",
      });
    }

    // Use your existing uploadImage utility function
    const result = await uploadImage(image, "training-programs");

    // Return success with image URL
    return res.status(200).json({
      success: true,
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload image",
      error: error.message,
    });
  }
});

export default router;
