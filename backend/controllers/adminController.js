import Admin from "../models/adminModel.js";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import Executive from "../models/executiveModel.js";
import Partner from "../models/partner/partner.model.js";

const userModels = {
  admin: Admin,
  sub_admin: Admin,
  marketing: Admin,
  executive: Executive,
  partner: Partner,
};

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || "admin",
    });

    await admin.save();

    if (admin) {
      res.status(201).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        message: "Admin registered successfully",
      });
    } else {
      res.status(400).json({ msg: "Invalid admin data" });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    console.log("loginAdmin controller");
    const { email, password, role } = req.body;
    console.log("data", email, password, role);

    // const admin = await Admin.findOne({ email });

    const UserModel = userModels[role];
    console.log("UserModel in loginAdmin", UserModel);

    if (!UserModel) {
      return res.status(401).json({ message: "Invalid user role in token." });
    }

    // const admin = await Admin.findOne({ email, isActive: true });
    const admin = await UserModel.findOne({ email, isActive: true });
    console.log("admin", admin);

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (admin.isLocked) {
      return res.status(423).json({
        message: "Account locked due to multiple failed attempts",
      });
    }

    const isPasswordValid = await admin.matchPasswords(password);

    if (!isPasswordValid) {
      await admin.incLoginAttempts();
      return res
        .status(401)
        .json({ message: "Wrong Password, Invalid credentials" });
    }

    // Clean expired tokens and generate new ones
    await admin.cleanExpiredTokens();
    const { accessToken, refreshToken } = generateToken(res, admin);

    // Store session token
    const sessionToken = {
      token: crypto.randomBytes(32).toString("hex"),
      createdAt: new Date(),
      // expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 7 days
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "unknown",
      userAgent: req.headers["user-agent"],
    };

    admin.sessionTokens.push(sessionToken);
    admin.lastLogin = new Date();
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save();

    res.cookie("sessionToken", sessionToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    res.json({
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin,
        token: accessToken,
        sessionExpiry: decoded.exp * 1000, // Convert to milliseconds
      },
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const admin = await Admin.findById(decoded.adminId);

    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Generate new access token
    const { accessToken } = generateToken(res, admin);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const logout = async (req, res) => {
  console.log("admin logout controller");
  try {
    const { id, role } = req.body;
    console.log("data", id, role);
    console.log("req", req.body);

    const UserModel = userModels[role];
    console.log("UserModel in logout", UserModel);

    if (!UserModel) {
      return res.status(401).json({ message: "Invalid user role in token." });
    }

    // const admin = await Admin.findOne({ email, isActive: true });
    const user = await UserModel.findOne({ _id: id, isActive: true });
    console.log("user", user);

    const { sessionToken } = req.cookies;

    console.log("sessionToken", sessionToken);

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

// route    GET /api/admin-profile
// @access   Private
export const getAdminProfile = async (req, res) => {
  console.log("getAdminProfile controller");
  try {
    const { user, role } = req;
    console.log("role", role);
    const UserModel = userModels[role];
    console.log("UserModel in loginAdmin", UserModel);

    if (!UserModel) {
      return res.status(401).json({ message: "Invalid user role in token." });
    }

    // const admin = await Admin.findById(req.user._id).select(
    const admin = await UserModel.findById(user._id).select(
      "-password -sessionTokens -twoFactorSecret"
    );

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllAdmins = async (req, res) => {
  console.log("getAllAdmins controller");
  try {
    const admins = await Admin.find(
      {},
      "-password -sessionTokens -refreshToken"
    );
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedAdmin)
      return res.status(404).json({ message: "Admin not found" });
    res.status(200).json(updatedAdmin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteAdmin = async (req, res) => {
  console.log("deleteAdmin controller");

  const { id } = req.params;
  console.log("id", id);
  try {
    await Admin.findByIdAndDelete(id);
    res.status(200).json({ message: "Admin deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
