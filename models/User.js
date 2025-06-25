import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
      minlength: [3, "Name must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
      maxlength: [100, "Email cannot exceed 100 characters"],
      minlength: [5, "Email must be at least 5 characters long"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [6, "Password must be at least 6 characters long"],
      // select: false, // Exclude password from query results by default
    },
    phone: {
      type: String,
      // required: [true, "Please enter your phone number"],
      trim: true,
      maxlength: [15, "Phone number cannot exceed 15 characters"],
      minlength: [10, "Phone number must be at least 10 characters long"],
    },
    address: {
      street: String,
      area: String,
      city: {
        type: String,
        // required: [true, "Please enter your city"],
        trim: true,
        maxlength: [80, "City cannot exceed 50 characters"],
      },
      postalCode: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"], // Specify that this is a GeoJSON Point
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    profileImage: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    otp: { type: String, default: "" },
    otpExpiration: { type: Date, default: null }, // OTP expiration time
    resetToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Create index for location-based queries
userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);
export default User;
