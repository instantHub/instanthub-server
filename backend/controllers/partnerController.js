import Partner from "../models/partnerModel.js";
import generateToken from "../utils/generateToken.js";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";

/**
 * @desc    Create a new partner
 * @route   POST /api/partners
 * @access  Private (Admin)
 */
export const createPartner = async (req, res) => {
  try {
    const { name, email, phone, companyName, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, phone, and password are required." });
    }

    const partnerExists = await Partner.findOne({
      $or: [{ email }, { phone }],
    });

    if (partnerExists) {
      return res.status(409).json({
        message: "A partner with this email or phone already exists.",
      });
    }

    const partner = await Partner.create({
      name,
      email,
      phone,
      companyName,
      password,
    });

    res.status(201).json(partner);
  } catch (error) {
    console.error("Error creating partner:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get all partners
 * @route   GET /api/partners
 * @access  Private (Admin)
 */
export const getPartners = async (req, res) => {
  try {
    const partners = await Partner.find({}).sort({ createdAt: -1 });
    res.status(200).json(partners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Update a partner
 * @route   PUT /api/partners/:id
 * @access  Private (Admin)
 */
export const updatePartner = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent password updates through this general-purpose endpoint
    if (req.body.password) {
      delete req.body.password;
    }

    const updatedPartner = await Partner.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedPartner) {
      return res.status(404).json({ message: "Partner not found." });
    }

    res.status(200).json(updatedPartner);
  } catch (error) {
    console.error("Error updating partner:", error);
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Email or phone already in use." });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Delete a partner
 * @route   DELETE /api/partners/:id
 * @access  Private (Admin)
 */
export const deletePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await Partner.findByIdAndDelete(id);

    if (!partner) {
      return res.status(404).json({ message: "Partner not found." });
    }

    res.status(200).json({ message: "Partner deleted successfully." });
  } catch (error) {
    console.error("Error deleting partner:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const loginPartner = async (req, res) => {
  try {
    console.log("loginPartner controller");
    const { email, password } = req.body;
    console.log("data", email, password);

    const partner = await Partner.findOne({ email, isActive: true });
    // console.log("partner", partner);

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
        permissions: partner.permissions,
        lastLogin: partner.lastLogin,
        token: accessToken,
        sessionExpiry: decoded.exp * 1000, // Convert to milliseconds
      },
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getPartnerProfile = async (req, res) => {
  // console.log("req.admin", req.admin);
  try {
    const partner = await Partner.findById(req.partner._id).select(
      "-password -sessionTokens -twoFactorSecret"
    );

    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    res.json(partner);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
