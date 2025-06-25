import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter the item title"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
      minlength: [3, "Title must be at least 3 characters long"],
    },
    description: {
      type: String,
      required: [true, "Please enter the item description"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      minlength: [10, "Description must be at least 10 characters long"],
    },
    category: {
      type: String,
      required: [true, "Please select a category"],
      enum: ["Electronics", "Furniture", "Clothing", "Books", "Other"],
    },
    image: [
      {
        type: String,
        required: [true, "Please upload at least one image"],
      },
    ],
    price: {
      type: Number,
      required: [true, "Please enter the item price"],
      min: [0, "Price cannot be negative"],
    },
    priceUnit: {
      type: String,
      required: [true, "Please select a price unit"],
      enum: ["day", "week", "month", "year"],
      default: "day",
    },
    condition: {
      type: String,
      required: [true, "Please select the item condition"],
      enum: ["New", "Like New", "Good", "Fair", "Poor"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Item must have an owner"],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"], // Specify that this is a GeoJSON Point
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model("Item", itemSchema);

export default Item;
