import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import asyncCatch from "../utils/asyncCatch.js";
import ApiError from "../utils/ApiError.js";

export const getAllUsers = asyncCatch(async (req, res) => {
  const users = await User.find({}, "-password -__v").exec();
  if (users.length === 0) {
    // return res.status(404).json({ message: "No users found" });
    throw new ApiError(404, "No users found");
  }
  res.status(200).json(users);
});

export const getUserById = asyncCatch(async (req, res) => {
  const userId = req.params.id;

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
});

export const updateUser = asyncCatch(async (req, res) => {
  const userId = req.params.id;
  const updateData = { ...req.body };

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
  }).select("-password -otp -otpExpiration -resetToken -isAdmin");

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user: updatedUser,
  });
});

export const deleteUser = asyncCatch(async (req, res, next) => {
  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, `Invalid userId`);
  }

  // Check if user exists
  const user = await User.findById(userId);

  console.log(user);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await User.findByIdAndDelete(userId);
  res.status(200).json({ message: "User deleted successfully" });
});
