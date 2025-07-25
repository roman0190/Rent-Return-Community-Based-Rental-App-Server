import { protect } from "../middleware/authMiddleware.js";
import {
  createItem,
  deleteItem,
  getAllItems,
  getItemById,
  getMyItems,
  getNearbyItems,
  toggleAvailability,
  updateItem,
} from "../controllers/itemController.js";
import express from "express";
import { checkItemLimit } from "../middleware/itemLimitMiddleware.js";
import { ItemValidation } from "../middleware/itemValidation.js";

const router = express.Router();

router.get("/", getAllItems);
router.get("/get-nearby-items", getNearbyItems); // Get nearby items
router.get("/get-item/:id", getItemById); // Get single item
// router.get("/get-items-by-owner/:ownerId", getItemsByOwner);  // Get items by specific owner

// Protected routes (authentication required)
router.use(protect); // All routes below need authentication

router.get("/get-my-items", getMyItems); // Get current user's items
// router.get("/get-my-stats", getUserItemStats);                // Get user's item statistics
router.post("/create-item", checkItemLimit, createItem); // Create item (with 10 item limit)
router.put("/update-item/:id", ItemValidation, updateItem); // Update item
router.delete("/delete-item/:id", ItemValidation, deleteItem); // Delete item
router.patch("/toggle-availability/:id", ItemValidation, toggleAvailability); // Toggle item availability

export default router;
