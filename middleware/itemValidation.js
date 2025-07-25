import Item from "../models/Item.js";
import { ApiError, asyncCatch } from "../utils/index.js";
import mongoose from "mongoose";

export const ItemValidation = asyncCatch(async (req, res, next) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid item ID");
  }

  // Find item in database
  const item = await Item.findById(id);

  // Check if item exists
  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  // Check ownership permission (admin can access all items)
  if (item.owner.toString() !== req.user.id && !req.user.isAdmin) {
    throw new ApiError(
      403,
      "You can only perform this action on your own items"
    );
  }

  // Attach item to request for reuse
  req.item = item;

  next();
});
