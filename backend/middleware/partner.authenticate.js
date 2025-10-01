import jwt from "jsonwebtoken";
import Partner from "../models/partnerModel.js";

export const partner_authenticate = async (req, res, next) => {
  console.log("partner_authenticate");

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

    /*
        Find partner and verify session
        we are decoding adminId from token because we used adminId while signing the token in generateToken function
    **/
    const partner = await Partner.findById(decoded.adminId);
    // console.log("partner from authenticate", partner);

    if (!partner || !partner.isActive) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Verify session token exists and is valid
    const validSession = partner.sessionTokens.find(
      (session) =>
        session.token === sessionToken && session.expiresAt > new Date()
    );

    if (!validSession) {
      return res.status(401).json({ message: "Invalid session" });
    }

    // Check if password was changed after token was issued
    const tokenIssuedAt = new Date(decoded.iat * 1000);
    if (
      partner.passwordChangedAt &&
      tokenIssuedAt < partner.passwordChangedAt
    ) {
      return res
        .status(401)
        .json({ message: "Password changed, please login again" });
    }

    req.partner = partner;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(401).json({ message: "Invalid token: authenticate catch" });
  }
};
