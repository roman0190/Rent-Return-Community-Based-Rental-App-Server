import {
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/userController.js";
import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/get-user/:id", getUserById);
router.use(protect);
router.put("/update-user/:id", updateUser);
router.use(admin);
router.get("/", getAllUsers);
router.delete("/delete-user/:id", deleteUser);
//not implemented yet
// router.post("/", createUser);

export default router;
