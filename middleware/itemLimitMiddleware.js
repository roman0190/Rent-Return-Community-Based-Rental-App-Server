import Item from "../models/Item.js";
import ApiError from "../utils/ApiError.js";
import asyncCatch from "../utils/asyncCatch.js";

// Check if user has reached 10 item limit
export const checkItemLimit = asyncCatch(async (req, res, next) => {
  // Count user's current items
  const userItemCount = await Item.countDocuments({
    owner: req.user.id,
  });

  // Maximum items per user
  const MAX_ITEMS_PER_USER = 10;

  // Check if user has reached the limit
  if (userItemCount >= MAX_ITEMS_PER_USER) {
    throw new ApiError(
      400,
      `You can only post maximum ${MAX_ITEMS_PER_USER} items. Current items: ${userItemCount}. Please delete some items to add new ones.`
    );
  }

  // Add limit info to request
  req.itemLimitInfo = {
    currentItems: userItemCount,
    maxItems: MAX_ITEMS_PER_USER,
    remaining: MAX_ITEMS_PER_USER - userItemCount,
  };

  // Proceed to next middleware
  next();
});
