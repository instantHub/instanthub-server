import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";

// TODO: Remove this file and use generic auth middleware from auth.js
export const authenticate = async (req, res, next) => {
  console.log("authenticate");

  try {
    const { accessToken, sessionToken } = req.cookies;
    // console.log("accessToken", accessToken);
    // console.log("sessionToken", sessionToken);

    if (!accessToken || !sessionToken) {
      return res.status(401).json({
        message: "No authentication tokens provided",
        tokenExpired: true,
      });
    }

    // Verify access token
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    // Find admin and verify session
    const admin = await Admin.findById(decoded.adminId);
    // console.log("admin from authenticate", admin);

    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Verify session token exists and is valid
    const validSession = admin.sessionTokens.find(
      (session) =>
        session.token === sessionToken && session.expiresAt > new Date()
    );

    if (!validSession) {
      return res.status(401).json({ message: "Invalid session" });
    }

    // Check if password was changed after token was issued
    const tokenIssuedAt = new Date(decoded.iat * 1000);
    if (admin.passwordChangedAt && tokenIssuedAt < admin.passwordChangedAt) {
      return res
        .status(401)
        .json({ message: "Password changed, please login again" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(401).json({ message: "Invalid token: authenticate catch" });
  }
};
