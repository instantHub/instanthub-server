import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";

const protect = async (req, res, next) => {
  let token;

  // Get token from cookies
  token = req.cookies.jwt;

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get admin from token (exclude password)
      req.admin = await Admin.findById(decoded.adminId).select("-password");

      if (!req.admin) {
        return res.status(401).json({ message: "Admin not found" });
      }

      next(); // Continue to next middleware/route handler
    } catch (error) {
      console.error("Token verification failed:", error);

      // Clear the invalid/expired cookie
      res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      });

      return res.status(401).json({
        message: "Not authorized, token failed",
        tokenExpired: true, // Flag to indicate token expiration
      });
    }
  } else {
    return res.status(401).json({
      message: "Not authorized, no token",
      tokenExpired: true,
    });
  }
};

export { protect };
