import mongoose from "mongoose";
import Item from "../models/Item.js";
import asyncCatch from "../utils/asyncCatch.js";
import ApiError from "../utils/ApiError.js";

export const getAllItems = asyncCatch(async (req, res) => {
  const {
    category, // Filter by category
    minPrice, // Minimum price filter
    maxPrice, // Maximum price filter
    condition, // Item condition filter
    priceUnit, // Filter by price unit (day, week, month, year)
    search, // Search in title/description
    lat, // Latitude for location filtering
    lng, // Longitude for location filtering
    distance = 10, // Distance in km (default: 10km)
    page = 1, // Current page (default: 1)
    limit = 12, // Items per page (default: 12)
  } = req.query;

  const query = { available: true };

  // Add category filter if provided
  if (category && category != "all") {
    query.category = category;
  }
  // Add price range filter if provided
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice); // Greater than or equal
    if (maxPrice) query.price.$lte = Number(maxPrice); // Less than or equal
  }
  // Add condition filter if provided
  if (condition && condition !== "all") {
    query.condition = condition;
  }

  // Add price unit filter if provided
  if (priceUnit && priceUnit !== "all") {
    query.priceUnit = priceUnit;
  }

  // Add location-based filtering if coordinates provided
  if (lat && lng) {
    query.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)], // [longitude, latitude]
        },
        $maxDistance: parseInt(distance) * 1000, // Convert km to meters
      },
    };
  }

  // Add search functionality for title and description
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } }, // Case-insensitive search in title
      { description: { $regex: search, $options: "i" } }, // Case-insensitive search in description
    ];
  }

  // Calculate pagination values
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber; // Items to skip for pagination

  // Execute database query with population and sorting
  const items = await Item.find(query)
    .populate("owner", "name email phone") // Get owner details
    .sort({ createdAt: -1 }) // Sort by newest first
    .skip(skip) // Skip items for pagination
    .limit(limitNumber); // Limit number of results

  // Get total count for pagination info
  const totalItems = await Item.countDocuments(query);

  // Send response with items and pagination info
  res.status(200).json({
    success: true,
    count: items.length, // Items in current page
    totalItems, // Total items matching query
    totalPages: Math.ceil(totalItems / limitNumber), // Total pages
    currentPage: pageNumber, // Current page number
    items, // Array of items
  });
});

// Get single item by ID
export const getItemById = asyncCatch(async (req, res) => {
  // Extract item ID from URL parameters
  const { id } = req.params;

  // Validate if ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid item ID");
  }

  // Find item by ID and populate owner details
  const item = await Item.findById(id).populate("owner", "name email phone");

  // Check if item exists
  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  // Send item data in response
  res.status(200).json({
    success: true,
    item,
  });
});

//Create new item
export const createItem = asyncCatch(async (req, res) => {
  // Extract item data from request body
  const {
    title,
    description,
    category,
    image,
    price,
    priceUnit = "day", // Default to 'day' if not provided
    condition,
    location,
  } = req.body;

  // Validate required fields
  if (!title || !description || !category || !price || !condition) {
    throw new ApiError(400, "Please provide all required fields");
  }

  // Validate image array
  if (!image || image.length === 0) {
    throw new ApiError(400, "Please upload at least one image");
  }

  // Validate location coordinates according to your model
  if (!location || !location.coordinates || location.coordinates.length !== 2) {
    throw new ApiError(
      400,
      "Please provide valid location coordinates [longitude, latitude]"
    );
  }

  // Prepare item data for database
  const itemData = {
    title: title.trim(),
    description: description.trim(),
    category,
    image,
    price,
    priceUnit,
    condition,
    owner: req.user.id, // Get owner ID from authenticated user
    location: {
      type: "Point", // GeoJSON format as per your model
      coordinates: location.coordinates, // [longitude, latitude]
    },
  };
  // Create item in database
  const item = await Item.create(itemData);
  // Populate owner details for response
  const populatedItem = await Item.findById(item._id).populate(
    "owner",
    "name email phone"
  );
  // Send success response
  res.status(201).json({
    success: true,
    message: "Item created successfully",
    item: populatedItem,
    itemLimitInfo: req.itemLimitInfo,
  });
});

// Update item
export const updateItem = asyncCatch(async (req, res) => {
  const { id } = req.params;

  // Item already validated by middleware
  // No need for validation code here

  if (req.body.owner) {
    delete req.body.owner;
  }

  const updatedItem = await Item.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate("owner", "name email phone");

  res.status(200).json({
    success: true,
    message: "Item updated successfully",
    item: updatedItem,
  });
});

// Delete item (simplified)
export const deleteItem = asyncCatch(async (req, res) => {
  const { id } = req.params;

  // Item already validated by middleware
  await Item.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Item deleted successfully",
  });
});

// Get current user's items (ultra simple)
export const getMyItems = asyncCatch(async (req, res) => {
  // Get all user's items (max 10)
  const items = await Item.find({ owner: req.user.id }).sort({ createdAt: -1 });

  // Send response
  res.status(200).json({
    success: true,
    count: items.length,
    items,
  });
});

// Toggle item availability status
// Toggle availability (simplified)
export const toggleAvailability = asyncCatch(async (req, res) => {
  // Use item from middleware
  const item = req.item;

  item.available = !item.available;
  await item.save();

  res.status(200).json({
    success: true,
    message: `Item is now ${item.available ? "available" : "unavailable"}`,
    available: item.available,
  });
});

// Get items near a specific location
export const getNearbyItems = asyncCatch(async (req, res) => {
  // Extract location parameters from query
  const { lat, lng, distance = 5, limit = 20 } = req.body;

  // Validate required coordinates
  if (!lat || !lng) {
    throw new ApiError(400, "Please provide latitude and longitude");
  }

  // Find items within specified distance
  const items = await Item.find({
    available: true,
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: parseInt(distance) * 1000,
      },
    },
  })
    .populate("owner", "name email phone")
    .limit(parseInt(limit));

  // Send nearby items in response
  res.status(200).json({
    success: true,
    count: items.length,
    items,
  });
});
