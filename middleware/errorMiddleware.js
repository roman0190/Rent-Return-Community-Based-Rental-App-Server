import ApiError from "../utils/ApiError.js";

export const notFound = (req, res) => {
  throw new ApiError(404, `Not Found - ${req.originalUrl}`);
};

// General Error Handler
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;

  // Mongoose bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    const validationErrors = Object.values(err.errors).map(
      (val) => val.message
    );
    message = `Validation Error: ${validationErrors.join(", ")}`;
  }

  // Mongoose duplicate field error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? err.stack : "🥞",
  });
};
