import Admin from "../models/adminModel.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import Brand from "../models/brandModel.js";
import Order from "../models/orderModel.js";
import RecycleOrder from "../models/recycleOrderModel.js";
import Stock from "../models/stocksModel.js";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

export const registerAdmin = async (req, res) => {
  console.log("registerAdmin controller");
  console.log("req", req.body);
  const { name, email, password } = req.body;

  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    res.status(401).json({ msg: "Admin already exists" });
  }

  const admin = await Admin.create({
    name,
    email,
    password,
  });

  if (admin) {
    // generateToken(res, admin._id);
    res.status(201).json(admin);
  } else {
    res.status(401).json({ msg: "Invalid admin data" });
  }
  //   res.status(200).json({ msg: "registerAdmin Admin" });
};

export const authAdmin = async (req, res) => {
  console.log("authAdmin controller");
  const { email, password } = req.body;
  //   console.log(email, password);

  const admin = await Admin.findOne({ email });

  if (admin && (await admin.matchPasswords(password))) {
    // Since JWT token is getting saved now generate token and save it to browser cookie
    // generateToken(res, admin);
    // console.log("Cookies from authAdmin:", req.cookies);
    // TODO cookies are being sent but not getting stored in browser

    res.status(201).json(admin);
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }

  //   res.status(200).json({ msg: "Auth Admin" });
};

// route    POST /api/logout
// @access   Private
export const logout = async (req, res) => {
  console.log("logout controller");

  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  // res.clearCookie('jwt', { path: '/' });

  res.status(200).json({ msg: "Admin logged out" });
};

export const getAdmin = async (req, res) => {
  console.log("getAdmin controller");
  try {
    // const { id } = req.params;
    // const admin = await Admin.findById(id);
    // res.status(200).json(admin);
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
    const ordersCount = await Order.countDocuments();
    const ordersPendingCount = await Order.countDocuments({
      status: "pending",
    });
    const ordersCompletedCount = await Order.countDocuments({
      status: "received",
    });
    const recycleOrdersCount = await RecycleOrder.countDocuments();
    const stocksCount = await Stock.countDocuments();
    const stocksInCount = await Stock.countDocuments({
      stockStatus: "Stock In",
    });
    const stocksOutCount = await Stock.countDocuments({
      stockStatus: "Stock Out",
    });

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
      ordersPendingCount,
      ordersCompletedCount,
      recycleOrdersCount,
      stocksCount,
      stocksInCount,
      stocksOutCount,
      productsCountByCategory,
      detailedProductsCount,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
