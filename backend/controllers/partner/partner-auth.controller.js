import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import generateToken from "../../utils/generateToken.js";
import Partner from "../../models/partner/partner.model.js";
import Executive from "../../models/executiveModel.js";

const userModels = {
  partner: Partner,
  partner_executive: Executive,
};

export const partnerLogin = async (req, res) => {
  try {
    console.log("partnerLogin controller called..!");
    const { email, password, role } = req.body;
    console.log("data", email, password, role);

    const UserModel = userModels[role];
    console.log("UserModel in partnerLogin", UserModel);

    if (!UserModel) {
      return res.status(401).json({ message: "Invalid user role in token." });
    }

    const partner = await UserModel.findOne({ email, isActive: true });
    console.log("partner", partner);

    if (!partner) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (partner.isLocked) {
      return res.status(423).json({
        message: "Account locked due to multiple failed attempts",
      });
    }

    const isPasswordValid = await partner.matchPasswords(password);

    if (!isPasswordValid) {
      await partner.incLoginAttempts();
      return res
        .status(401)
        .json({ message: "Wrong Password, Invalid credentials" });
    }

    // Clean expired tokens and generate new ones
    await partner.cleanExpiredTokens();
    const { accessToken, refreshToken } = generateToken(res, partner);

    // Store session token
    const sessionToken = {
      token: crypto.randomBytes(32).toString("hex"),
      createdAt: new Date(),
      // expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 7 days
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "unknown",
      userAgent: req.headers["user-agent"],
    };

    partner.sessionTokens.push(sessionToken);
    partner.lastLogin = new Date();
    partner.loginAttempts = 0;
    partner.lockUntil = undefined;
    await partner.save();

    res.cookie("sessionToken", sessionToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    res.json({
      partner: {
        id: partner._id,
        name: partner.name,
        email: partner.email,
        role: partner.role,
        partnerID: partner.partnerID,
        permissions: partner.permissions,
        lastLogin: partner.lastLogin,
        sessionExpiry: decoded.exp * 1000, // Convert to milliseconds
      },
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const partnerLogout = async (req, res) => {
  console.log("partnerLogout controller called..!");
  try {
    const { id, role } = req.body;
    console.log("data", id, role);

    const UserModel = userModels[role];
    console.log("UserModel in logout", UserModel);

    if (!UserModel) {
      return res.status(401).json({ message: "Invalid user role in token." });
    }

    // const admin = await Admin.findOne({ email, isActive: true });
    const user = await UserModel.findOne({ _id: id, isActive: true });
    console.log("user", user?.name);

    const { sessionToken } = req.cookies;

    if (sessionToken) {
      await UserModel.updateOne(
        { _id: req.body.id },
        { $pull: { sessionTokens: { token: sessionToken } } }
      );
    }

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.clearCookie("sessionToken");

    res.status(200).json({ status: 200, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Server error" });
  }
};

export const getPartnerProfile = async (req, res) => {
  console.log("getPartnerProfile controller called");

  try {
    const { _id, role } = req.user;
    console.log("req.user", _id, role);

    const UserModel = userModels[role];
    console.log("UserModel in getPartnerProfile", UserModel);

    if (!UserModel) {
      return res.status(401).json({ message: "Invalid user role in token." });
    }

    const user = await UserModel.findById(_id).select(
      "-password -sessionTokens -twoFactorSecret -isActive -loginAttempts -lockUntil -createdAt -updatedAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
