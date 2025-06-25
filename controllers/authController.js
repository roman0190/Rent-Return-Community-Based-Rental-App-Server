import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/mailer.js";
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    //Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message:
          "Email not verified. Please verify your email before logging in.",
      });
    }
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    // Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    // Validate request
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, email, password, phone",
      });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // // Generate OTP for verification
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });
    // Create JWT token
    const token = jwt.sign(
      { id: newUser._id, name: newUser.name, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    // Send response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email address",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiration = new Date(Date.now() + 2 * 60 * 1000); // OTP valid for 2 minutes

    // Find user by email
    const user = await User.findOneAndUpdate({ email }, { otp, otpExpiration });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }
    // Send verification email (optional)
    const name = user.name || "User"; // Fallback to "User" if name is not set
    await sendVerificationEmail(email, name, otp);
    // Update user with OTP and expiration time
    res.status(200).json({
      success: true,
      message: "otp send to email",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate request
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and OTP",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp || new Date() > user.otpExpiration) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // 1. Create random token
    const token = crypto.randomBytes(32).toString("hex");

    // 2. Optionally hash before saving to DB
    const resetToken = crypto.createHash("sha256").update(token).digest("hex");
    // Clear OTP and expiration time
    user.otp = "";
    user.otpExpiration = null;
    user.isEmailVerified = true; // Mark email as verified
    user.resetToken = resetToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during OTP verification",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, token } = req.body;

    const user = await User.findOne({ email, resetToken: token });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid token or user not found",
      });
    }
    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetToken = "";
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
};
