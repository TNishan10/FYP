import {
  createResetOTP,
  verifyOTP,
  deleteOTP,
  markOTPAsUsed,
} from "../models/passwordReset.js";
import { sendEmail } from "../utility/email.js";
import bcrypt from "bcrypt";
import pool from "../db.js";

// Generate a random 6-digit OTP
const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

// Send password reset OTP via email
export const forgotPassword = async (req, res) => {
  // Add debugging statements
  console.log("Forgot password endpoint hit");
  console.log("Request body:", req.body);

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if email exists in database
    const userResult = await pool.query(
      "SELECT * FROM users WHERE user_email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    await createResetOTP(email, otp);

    // Send email with OTP
    const emailSubject = "OX-Fit Password Reset";
    const emailBody = `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Use the verification code below to continue:</p>
        <h3 style="font-size: 24px; letter-spacing: 2px; text-align: center; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">${otp}</h3>
        <p>This code is valid for 10 minutes.</p>
        <p>If you didn't request this change, you can safely ignore this email.</p>
        <p>Regards,<br>OX-Fit Team</p>
      `;

    await sendEmail(email, emailSubject, emailBody);

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    // Enhanced error logging
    console.error("Detailed error in forgotPassword:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
      error: error.message,
    });
  }
};

// Verify the OTP entered by user
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Validate OTP
    const isValid = await verifyOTP(email, otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Error in verifyResetOTP:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};

// Reset password after OTP verification
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });
    }

    // Validate OTP one more time
    const isValid = await verifyOTP(email, otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await pool.query("UPDATE users SET user_password = $1 WHERE user_email = $2", [
      hashedPassword,
      email,
    ]);

    // Mark OTP as used (for audit trail)
    await markOTPAsUsed(email);

    // Delete used OTP - optional, can keep for audit instead
    // await deleteOTP(email);

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};
