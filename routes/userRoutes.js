import {
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/userController.js";
import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
const router = express.Router();
router.use(protect);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.use(admin);
router.get("/", getAllUsers);
// router.delete("/:id", deleteUser);
//not implemented yet
// router.post("/", createUser);

export default router;
