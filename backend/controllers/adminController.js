import Admin from "../models/adminModel.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import Brand from "../models/brandModel.js";
import Order from "../models/orderModel.js";
import RecycleOrder from "../models/recycleOrderModel.js";
import Stock from "../models/stocksModel.js";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password || !department) {
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
      department,
    });

    await admin.save();

    if (admin) {
      generateToken(res, admin); // Fixed: pass admin object, not admin._id
      console.log("Cookie set for admin:", admin.email);

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
    const { email, password } = req.body;
    console.log("data", email, password);

    // const admin = await Admin.findOne({ email });

    const admin = await Admin.findOne({ email, isActive: true });
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

    // Set secure httpOnly cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    res.cookie("sessionToken", sessionToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    res.json({
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const validateToken = async (req, res) => {
  console.log("validateToken controller");
  try {
    const token = req.cookies.accessToken; // or however you named your cookie
    console.log("accessToken from validateToken", token);

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user data if needed
    const admin = await Admin.findById(decoded.adminId);

    res.json({
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin,
      },
      sessionExpiry: decoded.exp * 1000, // Convert to milliseconds
    });
  } catch (error) {
    // Token is invalid or expired
    res.status(401).json({ error: "Invalid token" });
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
    const { sessionToken } = req.cookies;
    console.log("req", req.body);
    console.log("sessionToken", sessionToken);

    if (sessionToken) {
      // Remove session token from database
      await Admin.updateOne(
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
  // console.log("req.admin", req.admin);
  try {
    const admin = await Admin.findById(req.admin._id).select(
      "-password -sessionTokens -twoFactorSecret"
    );
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdmin = async (req, res) => {
  console.log("getAdmin controller");
  try {
    const admin = req.admin;

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      createdAt: admin.createdAt,
      message: "Profile fetched successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    console.log("updateAdmin controller");
    const { name, email, password, id } = req.body;

    // Find the admin by ID
    const admin = await Admin.findById(id);
    console.log("admin found", admin);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Optionally check if email is being updated and already taken
    if (email && email !== admin.email) {
      const emailTaken = await Admin.findOne({ email });
      if (emailTaken) {
        return res.status(400).json({ message: "Email already in use" });
      }
      admin.email = email;
    }

    admin.name = name || admin.name;

    if (password) {
      admin.password = password; // pre-save hook will hash it
    }

    const updatedAdmin = await admin.save();

    res
      .status(200)
      .json({ updatedAdmin, message: "Admin updated successfully" });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Dashboard Route

export const dashboardDetail = async (req, res) => {
  console.log("dashboardDetail controller");

  try {
    const categories = await Category.find().select("name -_id");
    // const cat = { count: categories.length, categories };
    // console.log(cat);
    const categoriesCount = await Category.countDocuments();
    const brandsCount = await Brand.countDocuments();
    const productsCount = await Product.countDocuments();
    // const ordersCount = await Order.countDocuments();
    // const ordersPendingCount = await Order.countDocuments({
    //   status: 'pending',
    // });
    // const ordersCompletedCount = await Order.countDocuments({
    //   status: "received",
    // });

    const EMPTY_ORDERS = {
      total: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
    };

    // Sell Orders
    const ordersCountArray = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 }, // Total count of documents
          pending: { $sum: { $cond: ["$status.pending", 1, 0] } },
          completed: { $sum: { $cond: ["$status.completed", 1, 0] } },
          cancelled: { $sum: { $cond: ["$status.cancelled", 1, 0] } },
        },
      },
    ]);
    const ordersCount = ordersCountArray[0] || EMPTY_ORDERS;

    console.log("ordersCount", ordersCount);

    // Recycle Orders
    const recycleOrdersCountArray = await RecycleOrder.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 }, // Total count of documents
          pending: { $sum: { $cond: ["$status.pending", 1, 0] } },
          completed: { $sum: { $cond: ["$status.completed", 1, 0] } },
          cancelled: { $sum: { $cond: ["$status.cancelled", 1, 0] } },
        },
      },
    ]);
    const recycleOrdersCount = recycleOrdersCountArray[0] || EMPTY_ORDERS;

    console.log("recycleOrdersCount", recycleOrdersCount);

    // const stocksCount = await Stock.countDocuments();
    // const stocksInCount = await Stock.countDocuments({
    //   stockStatus: "Stock In",
    // });
    // const stocksOutCount = await Stock.countDocuments({
    //   stockStatus: "Stock Out",
    // });

    const EMPTY_STOCK = {
      total: 0,
      in: 0,
      out: 0,
      lost: 0,
    };

    const stocksCountArray = await Stock.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 }, // Total count of documents
          in: { $sum: { $cond: ["$status.in", 1, 0] } },
          out: { $sum: { $cond: ["$status.out", 1, 0] } },
          lost: { $sum: { $cond: ["$status.lost", 1, 0] } },
        },
      },
    ]);
    const stocksCount = stocksCountArray[0] || EMPTY_STOCK;
    console.log("stocksCount", stocksCount);

    // const products = await Product.find().populate({ category });
    const productsCatWise = "";

    const productsCountByCategory = await Product.aggregate([
      {
        $group: {
          _id: "$category", // Group by the 'category' field
          count: { $sum: 1 }, // Count the number of products in each category
        },
      },
      {
        $lookup: {
          from: "categories", // Reference the 'categories' collection
          localField: "_id", // The '_id' field is the category ID
          foreignField: "_id", // Match it with the '_id' of the category in the 'categories' collection
          as: "category", // Populate the 'category' field with the matching category data
        },
      },
      { $unwind: "$category" }, // Flatten the category object
      {
        $project: {
          categoryName: "$category.name", // Select the category name
          count: 1, // Include the count of products
          _id: 0, // Exclude the _id field
        },
      },
    ]);

    // console.log("Products Count by Category:", productsCountByCategory);

    const detailedProductsCount = await Product.aggregate([
      {
        // Populate the category and brand for each product
        $lookup: {
          from: "categories", // Join the categories collection
          localField: "category", // Field in products referencing category
          foreignField: "_id", // Field in categories collection
          as: "categoryInfo", // Result will be added to the "categoryInfo" array
        },
      },
      {
        $unwind: "$categoryInfo", // Unwind the "categoryInfo" array to use it in the next step
      },
      {
        // Populate the brand for each product
        $lookup: {
          from: "brands", // Join the brands collection
          localField: "brand", // Field in products referencing brand
          foreignField: "_id", // Field in brands collection
          as: "brandInfo", // Result will be added to the "brandInfo" array
        },
      },
      {
        $unwind: "$brandInfo", // Unwind the "brandInfo" array to use it
      },
      {
        // Group by category and brand and count products
        $group: {
          _id: { category: "$categoryInfo.name", brand: "$brandInfo.name" }, // Group by category and brand
          productCount: { $sum: 1 }, // Count the number of products in each group
        },
      },
      {
        // Restructure the data into category -> brands -> product count
        $group: {
          _id: "$_id.category", // Group by category name
          brands: {
            $push: { brand: "$_id.brand", productCount: "$productCount" }, // Push each brand with product count into brands array
          },
        },
      },
      {
        // Format the output to get the final result
        $project: {
          _id: 0, // Remove _id from the final output
          category: "$_id", // Rename _id to category
          brands: 1, // Include the brands array
        },
      },
    ]);

    // console.log("detailedProductsCount", detailedProductsCount);

    res.status(201).json({
      categories,
      brandsCount,
      productsCount,
      ordersCount,
      ordersCount,
      recycleOrdersCount,
      stocksCount,
      productsCountByCategory,
      detailedProductsCount,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
