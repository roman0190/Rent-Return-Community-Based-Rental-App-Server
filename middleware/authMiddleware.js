import User from "../models/User.js";
import jwt from "jsonwebtoken";
export function protect(req, res, next) {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        // isAdmin: decoded.isAdmin,
      };
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
}

// Admin middleware - requires isAdmin field in token payload
export async function admin(req, res, next) {
  const userId = req.user.id;
  const user = await User.findById(userId);
  if ((req.user && req.user.isAdmin) || (user && user.isAdmin)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
}
