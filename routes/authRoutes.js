import express from "express";
import { sendOtp, login, register, verifyOtp, resetPassword } from "../controllers/authController.js";

// import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/send-otp", sendOtp); //will change to forgotPassword later
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword); // Uncomment when implemented

export default router;
