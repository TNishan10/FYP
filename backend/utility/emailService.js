import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const sendVerificationEmail = async (email, token) => {
  try {
    console.log(`Attempting to send verification email to: ${email}`);
    console.log("Email configuration:", {
      user: process.env.EMAIL_USER,
      pass_provided: process.env.EMAIL_PASSWORD ? "Yes" : "No",
      frontend_url: process.env.FRONTEND_URL,
    });

    // Create transport with detailed logging
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      debug: true, // Enable debug output
    });

    // Extract a 6-character verification code from the token
    const verificationCode = token.substring(0, 6).toUpperCase();
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    console.log(`Generated verification code: ${verificationCode}`);
    console.log(`Generated verification URL: ${verificationUrl}`);

    const mailOptions = {
      from: `"OX-Fit" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "OX-Fit - Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #060606;">Verify Your Email Address</h1>
          <p>Thank you for registering with OX-Fit! Please use this verification code:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; text-align: center; border-radius: 4px;">
            <h2 style="font-size: 28px; letter-spacing: 6px; font-weight: bold; margin: 0; color: #060606;">${verificationCode}</h2>
            <p style="margin: 10px 0 0; color: #666;">Enter this code in the verification page</p>
          </div>
          
          <p>You can also verify your email by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #060606; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0;">Verify My Email</a>
          
          <p style="color: #666; margin-top: 20px; font-size: 14px;">If you didn't create an account with OX-Fit, please ignore this email.</p>
          <p style="color: #666; font-size: 14px;">This code will expire in 24 hours.</p>
        </div>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return true;
  } catch (error) {
    console.error("Email sending failed with error:", error);
    return false;
  }
};
