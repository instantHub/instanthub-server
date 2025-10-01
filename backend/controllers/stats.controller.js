import Order from "../models/orderModel.js";
import { ORDER_STATUS } from "../constants/orders.js";

export const getMostSoldProductsAndBrands = async (req, res) => {
  try {
    // 1️⃣ Most Sold Products (Only Completed Orders)
    const mostSoldProducts = await Order.aggregate([
      { $match: { status: ORDER_STATUS.COMPLETED } }, // ✅ Filter completed orders

      {
        $group: {
          _id: "$productId",
          totalSold: { $sum: 1 },
        },
      },
      { $sort: { totalSold: -1 } },

      // 🔎 Lookup Product
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },

      // 🔎 Lookup Product's Category
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "product.category",
        },
      },
      { $unwind: "$product.category" },

      // 🔎 Lookup Product's Brand
      {
        $lookup: {
          from: "brands",
          localField: "product.brand",
          foreignField: "_id",
          as: "product.brand",
        },
      },
      { $unwind: "$product.brand" },

      // ✅ Only required fields
      {
        $project: {
          _id: 0,
          totalSold: 1,
          product: {
            name: 1,
            uniqueURL: 1,
            image: 1,
            variants: 1,
            category: {
              _id: 1,
              name: 1,
              uniqueURL: 1,
            },
            brand: {
              _id: 1,
              name: 1,
              uniqueURL: 1,
            },
          },
        },
      },
    ]);

    // 2️⃣ Most Selling Brands (Only Completed Orders)
    const mostSellingBrands = await Order.aggregate([
      { $match: { status: ORDER_STATUS.COMPLETED } },

      // 🔎 Lookup product for each order
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },

      {
        $group: {
          _id: "$product.brand",
          totalSold: { $sum: 1 },
        },
      },
      { $sort: { totalSold: -1 } },

      // 🔎 Lookup Brand
      {
        $lookup: {
          from: "brands",
          localField: "_id",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: "$brand" },

      // 🔎 Lookup Brand's Category
      {
        $lookup: {
          from: "categories",
          localField: "brand.category",
          foreignField: "_id",
          as: "brand.category",
        },
      },
      { $unwind: "$brand.category" },

      // ✅ Only required fields
      {
        $project: {
          _id: 0,
          totalSold: 1,
          brand: {
            name: 1,
            uniqueURL: 1,
            image: 1,
            category: {
              _id: 1,
              name: 1,
              uniqueURL: 1,
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      mostSoldProducts,
      mostSellingBrands,
    });
  } catch (error) {
    console.error("Error fetching most sold stats:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
