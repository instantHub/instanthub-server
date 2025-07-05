import Admin from "../models/adminModel.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import Brand from "../models/brandModel.js";
import Order from "../models/orderModel.js";
import RecycleOrder from "../models/recycleOrderModel.js";
import Stock from "../models/stocksModel.js";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

// export const registerAdmin = async (req, res) => {
//   console.log("registerAdmin controller");
//   console.log("req", req.body);
//   const { name, email, password } = req.body;

//   const adminExists = await Admin.findOne({ email });

//   if (adminExists) {
//     res.status(401).json({ msg: "Admin already exists" });
//   }

//   const admin = await Admin.create({
//     name,
//     email,
//     password,
//   });

//   if (admin) {
//     generateToken(res, admin._id);
//     console.log("Cookies from registerAdmin:", req.cookies);

//     res.status(201).json(admin);
//   } else {
//     res.status(401).json({ msg: "Invalid admin data" });
//   }
//   //   res.status(200).json({ msg: "registerAdmin Admin" });
// };

export const registerAdmin = async (req, res) => {
  try {
    console.log("registerAdmin controller");
    console.log("req", req.body);
    const { name, email, password } = req.body;

    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
      return res.status(400).json({ msg: "Admin already exists" }); // Fixed: use return and 400 status
    }

    const admin = await Admin.create({
      name,
      email,
      password,
    });

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
    console.error("Register error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const authAdmin = async (req, res) => {
  try {
    console.log("authAdmin controller");
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPasswords(password))) {
      generateToken(res, admin);
      console.log("Cookie set for login:", admin.email);

      res.status(200).json({
        // Fixed: use 200 for successful login
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        message: "Login successful",
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// export const authAdmin = async (req, res) => {
//   console.log("authAdmin controller");
//   const { email, password } = req.body;
//   //   console.log(email, password);

//   const admin = await Admin.findOne({ email });

//   if (admin && (await admin.matchPasswords(password))) {
//     // Since JWT token is getting saved now generate token and save it to browser cookie
//     generateToken(res, admin);
//     console.log("Cookies from authAdmin:", req.cookies);
//     // TODO cookies are being sent but not getting stored in browser

//     res.status(201).json(admin);
//   } else {
//     res.status(401).json({ message: "Invalid email or password" });
//   }

//   //   res.status(200).json({ msg: "Auth Admin" });
// };

// route    POST /api/logout
// @access   Private
export const logout = async (req, res) => {
  // console.log("logout controller");

  // res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  // // res.clearCookie('jwt', { path: '/' });

  // res.status(200).json({ msg: "Admin logged out" });

  console.log("logout controller");
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ msg: "Admin logged out" });
};

export const getAdmin = async (req, res) => {
  console.log("getAdmin controller");
  try {
    // const { id } = req.params;
    // const admin = await Admin.findById(id);
    // res.status(200).json(admin);

    // req.admin is set by the protect middleware
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

// route    GET /api/admin-profile
// @access   Private
export const getAdminProfile = async (req, res) => {
  console.log("getAdminProfile controller");
  // console.log(req.admin);
  res.status(200).json({ msg: "getAdminProfile Admin" });
};

export const updateAdmin = async (req, res) => {
  console.log("updateAdmin controller");
  console.log("req", req.body);
  const { name, email, password, _id } = req.body;

  const adminExists = await Admin.findById(_id);

  if (adminExists) {
    adminExists.name = name || adminExists.name;
    adminExists.email = email || adminExists.email;
    adminExists.name = name || adminExists.name;

    if (password) {
      adminExists.password = password;
    }

    const updatedAdmin = await adminExists.save();

    res
      .status(200)
      .json({ updatedAdmin, message: "Admin Updated successfully" });
  }

  //   res.status(200).json({ msg: "registerAdmin Admin" });
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
