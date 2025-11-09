import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import Executive from "../models/executiveModel.js";
import Partner from "../models/partner/partner.model.js";
// import { log } from "node:console";

const userModels = {
  admin: Admin,
  sub_admin: Admin,
  executive: Executive,
  partner: Partner,
};

export const auth = async (req, res, next) => {
  console.log("Generic auth middleware");

  try {
    const { accessToken, sessionToken } = req.cookies;
    console.log("sessionToken in auth middleware", sessionToken);

    if (!accessToken || !sessionToken) {
      return res.status(401).json({
        message: "No authentication tokens provided.",
        tokenExpired: true,
      });
    }

    // Verify access token
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    console.log("decoded token in auth middleware", decoded);

    // Determine the user model based on the role in the token
    const UserModel = userModels[decoded.role];
    console.log("UserModel in auth middleware", UserModel);

    if (!UserModel) {
      return res.status(401).json({ message: "Invalid user role in token." });
    }

    // Find user and verify session
    const user = await UserModel.findById(decoded.id);
    console.log(
      "User " + user.name + " found in auth middleware - role ",
      user.role
    );

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or inactive." });
    }

    // Verify session token exists and is valid
    const validSession = user.sessionTokens.find(
      (session) =>
        session.token === sessionToken && session.expiresAt > new Date()
    );

    if (!validSession) {
      return res.status(401).json({ message: "Invalid session." });
    }

    // Check if password was changed after token was issued
    const tokenIssuedAt = new Date(decoded.iat * 1000);
    if (user.passwordChangedAt && tokenIssuedAt < user.passwordChangedAt) {
      return res
        .status(401)
        .json({ message: "Password changed, please login again." });
    }

    // Attach user and role to the request object
    req.user = user;
    req.role = decoded.role;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." });
    }
    res.status(401).json({ message: "Invalid token.", error: error.message });
  }
};
