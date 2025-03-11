import express from "express";
import {
  registerController,
  loginController,
  verifyEmail,
  resendVerification,
  verifyCode,
} from "../controllers/authController.js";

import { getSupplementController } from "../controllers/SupplementController.js";

import { UserHealthCondition } from "../controllers/UserHealthCondition.js";

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
import crypto from "crypto";
import con from "../server.js";

//router object
const router = express.Router();

// Public Routes
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

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

// // Protected Routes
// router.get("/healthcondition", requireSignIn, UserHealthCondition);
// router.get("/supplement", requireSignIn, getSupplementController);

//unprotected routes
router.get("/healthcondition", UserHealthCondition);
router.get("/supplement", getSupplementController);

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

export default router;
