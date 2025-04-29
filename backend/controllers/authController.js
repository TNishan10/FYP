import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import con from "../server.js";
import crypto from "crypto";
import { sendVerificationEmail } from "../utility/emailService.js";

export const registerController = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    console.log("Registration started for:", email);

    // Check if user already exists
    const existingUser = await con.query(
      "SELECT * FROM users WHERE user_email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "User already registered" });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24); // Token valid for 24 hours
    console.log(
      "Generated verification token:",
      verificationToken.substring(0, 10) + "..."
    );

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password);

    // Insert user with verification token - use the correct column names
    const result = await con.query(
      "INSERT INTO users (user_name, user_email, user_password, user_role, account_status, is_verified, verification_token, token_expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        name,
        email,
        hashedPassword,
        "user",
        "active",
        false,
        verificationToken,
        tokenExpiresAt,
      ]
    );
    console.log("User inserted into database:", result.rows[0].user_id);

    // Send verification email
    console.log("Attempting to send verification email...");
    const emailResult = await sendVerificationEmail(email, verificationToken);
    console.log("Email sending result:", emailResult);

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email for verification.",
      user: {
        email: result.rows[0].user_email,
        name: result.rows[0].user_name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error in registration",
      error: error.message,
    });
  }
};

// Email verification endpoint
export const verifyEmail = async (req, res) => {
  const { token } = req.body;

  try {
    // Find user with this token
    const result = await con.query(
      "SELECT * FROM users WHERE verification_token = $1 AND token_expires_at > NOW()",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Update user to verified
    await con.query(
      "UPDATE users SET is_verified = true, verification_token = NULL WHERE user_id = $1",
      [result.rows[0].user_id]
    );

    res.status(200).json({
      success: true,
      message: "Email successfully verified. You can now login.",
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying email",
      error: error.message,
    });
  }
};

// Resend verification email endpoint
export const resendVerification = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const result = await con.query(
      "SELECT * FROM users WHERE user_email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = result.rows[0];

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24); // Token valid for 24 hours

    // Update user with new token
    await con.query(
      "UPDATE users SET verification_token = $1, token_expires_at = $2 WHERE user_id = $3",
      [verificationToken, tokenExpiresAt, user.user_id]
    );

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({
      success: true,
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Error resending verification:", error);
    res.status(500).json({
      success: false,
      message: "Error sending verification email",
      error: error.message,
    });
  }
};

// Add this to authController.js
export const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    // Find the user by email
    const userResult = await con.query(
      "SELECT * FROM users WHERE user_email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    // Check if the user is already verified
    if (user.is_verified) {
      return res.status(200).json({
        success: true,
        message: "Email already verified. You can now login.",
      });
    }

    // Check if token exists and isn't expired
    if (!user.verification_token || user.token_expires_at < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Verification code expired or invalid",
      });
    }

    // Check if the first 6 characters of the token match the code
    // (case-insensitive comparison)
    const tokenCode = user.verification_token.substring(0, 6).toUpperCase();
    if (code.toUpperCase() !== tokenCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Valid code - mark user as verified
    await con.query(
      "UPDATE users SET is_verified = true, verification_token = NULL WHERE user_id = $1",
      [user.user_id]
    );

    res.status(200).json({
      success: true,
      message: "Email successfully verified. You can now login.",
    });
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying code",
      error: error.message,
    });
  }
};

// Update login controller to use the correct column names
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const result = await con.query(
      "SELECT * FROM users WHERE user_email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.rows[0];

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.user_password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login timestamp AFTER user is found and validated
    const updateLastLogin = `UPDATE public."users" SET last_login_at = NOW() WHERE user_id = $1`;
    await con.query(updateLastLogin, [user.user_id]);

    // Create and return token WITH verification status
    const token = JWT.sign(
      {
        id: user.user_id,
        email: user.user_email,
        name: user.user_name,
        isAdmin: user.user_role === "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.user_id,
          name: user.user_name,
          email: user.user_email,
          isVerified: user.is_verified || false,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error in login",
      error: error.message,
    });
  }
};

// Add this function to your authController.js

export const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    // Find user by email
    const userResult = await con.query(
      "SELECT * FROM users WHERE user_email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    // Check if verification token exists and isn't expired
    if (!user.verification_token || user.token_expires_at < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Reset code expired or invalid",
      });
    }

    // Check if the first 6 characters of the token match the OTP code
    const tokenCode = user.verification_token.substring(0, 6).toUpperCase();
    if (otp.toUpperCase() !== tokenCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset code",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password and remove verification token
    await con.query(
      "UPDATE users SET user_password = $1, verification_token = NULL WHERE user_id = $2",
      [hashedPassword, user.user_id]
    );

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message,
    });
  }
};

// Add this function to your authController.js

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const result = await con.query(
      "SELECT * FROM users WHERE user_email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.rows[0];

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 1); // Token valid for 1 hour

    // Update user with new token
    await con.query(
      "UPDATE users SET verification_token = $1, token_expires_at = $2 WHERE user_id = $3",
      [verificationToken, tokenExpiresAt, user.user_id]
    );

    // Send email with OTP code (first 6 chars of the token)
    const otpCode = verificationToken.substring(0, 6).toUpperCase();

    // You can use your existing sendVerificationEmail or create a new one for reset
    await sendVerificationEmail(
      email,
      verificationToken,
      "Password Reset Code",
      `Your password reset code is: ${otpCode}. Valid for 1 hour.`
    );

    res.status(200).json({
      success: true,
      message: "Reset code sent to your email",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({
      success: false,
      message: "Error processing request",
      error: error.message,
    });
  }
};
