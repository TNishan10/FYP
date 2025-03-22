import pool from "../db.js";

// Create a new OTP record
export const createResetOTP = async (email, otp) => {
  try {
    // Get the user_id from email - using user_email instead of email
    const userResult = await pool.query(
      "SELECT user_id FROM users WHERE user_email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      throw new Error("User not found");
    }

    const userId = userResult.rows[0].user_id;

    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete any existing OTPs for this user
    await pool.query("DELETE FROM password_reset_otps WHERE user_id = $1", [
      userId,
    ]);

    // Insert new OTP - email column should exist in password_reset_otps
    await pool.query(
      "INSERT INTO password_reset_otps (user_id, email, otp, expires_at) VALUES ($1, $2, $3, $4)",
      [userId, email, otp, expiresAt]
    );

    return true;
  } catch (error) {
    console.error("Error creating reset OTP:", error);
    throw error;
  }
};

// Verify an OTP
export const verifyOTP = async (email, otp) => {
  try {
    // Use email column in password_reset_otps table - this should be fine
    const result = await pool.query(
      "SELECT * FROM password_reset_otps WHERE email = $1 AND otp = $2 AND expires_at > NOW() AND is_used = FALSE",
      [email, otp]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

// Mark OTP as used
export const markOTPAsUsed = async (email) => {
  try {
    await pool.query(
      "UPDATE password_reset_otps SET is_used = TRUE WHERE email = $1",
      [email]
    );

    return true;
  } catch (error) {
    console.error("Error marking OTP as used:", error);
    throw error;
  }
};

// Delete an OTP
export const deleteOTP = async (email) => {
  try {
    await pool.query("DELETE FROM password_reset_otps WHERE email = $1", [
      email,
    ]);

    return true;
  } catch (error) {
    console.error("Error deleting OTP:", error);
    throw error;
  }
};
