import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcrypt";


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password -__v").exec();
    res.status(200).json(users);
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    // Check if userId is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({ message: "Invalid UserID" });
    }
       // Check if user exists
    const user = await User.findById(userId, "-password -__v").exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  const userId = req.params.id;
  const updateData = { ...req.body };

  try {
    // Check if userId is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({
        success: false,
        message: "Invalid UserID",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check authorization - user can only update their own profile unless admin
    if (userId !== req.user.id && !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this user",
      });
    }

    // If there's a password update, hash the new password
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Prevent updating sensitive fields
    const protectedFields = [
      "isAdmin",
      "isEmailVerified",
      "otp",
      "otpExpiration",
      "resetToken",
    ];
    if (!user.isAdmin) {
      protectedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
          delete updateData[field];
        }
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -otp -otpExpiration -resetToken");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error updating user",
    });
  }
};
