import Order from "../models/orderModel.js";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import Stocks from "../models/stocksModel.js";
import {
  HOSTINGER_MAILER,
  INSTANTHUB_GMAIL,
  ORDERS_EMAIL,
  SUPPORT_EMAIL,
} from "../constants/email.js";

import {
  ORDER_ASSIGN_AGENT_TEMPLATE,
  ORDER_CANCEL_TEMPLATE,
  ORDER_EMAIL_TEMPLATE,
  ORDER_PDF,
  ORDER_RECEIVED_PDF,
  ORDER_RECEIVED_TEMPLATE,
} from "../utils/emailTemplates/orders.js";
import { getTodayISTRange } from "../utils/getTodayISTRange.js";
import { createOrderPDF } from "../utils/pdf.creation.js";

export const getOrders = async (req, res) => {
  console.log("GetOrders controller");

  try {
    const ordersList = await Order.find().populate("productId", "name");
    // console.log(ordersList);
    res.status(200).json(ordersList);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getOrdersCounts = async (req, res) => {
  try {
    const { utcStartOfDay, utcEndOfDay } = getTodayISTRange();

    const [
      pending,
      completed,
      cancelled,
      pendingToday,
      completedToday,
      cancelledToday,
    ] = await Promise.all([
      Order.countDocuments({ "status.pending": true }),
      Order.countDocuments({ "status.completed": true }),
      Order.countDocuments({ "status.cancelled": true }),

      Order.countDocuments({
        "status.pending": true,
        createdAt: { $gte: utcStartOfDay, $lte: utcEndOfDay },
      }),
      Order.countDocuments({
        "status.completed": true,
        createdAt: { $gte: utcStartOfDay, $lte: utcEndOfDay },
      }),
      Order.countDocuments({
        "status.cancelled": true,
        createdAt: { $gte: utcStartOfDay, $lte: utcEndOfDay },
      }),
    ]);

    res.status(200).json({
      total: {
        pending,
        completed,
        cancelled,
      },
      today: {
        pending: pendingToday,
        completed: completedToday,
        cancelled: cancelledToday,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order counts",
      error: error.message,
    });
  }
};

export const getTodaysOrders = async (req, res) => {
  try {
    const { utcStartOfDay, utcEndOfDay } = getTodayISTRange();

    const orders = await Order.find({
      createdAt: { $gte: utcStartOfDay, $lte: utcEndOfDay },
    }).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch today's orders",
      error: error.message,
    });
  }
};

// 2. Get Pending Orders
export const getPendingOrders = async (req, res) => {
  try {
    // const orders = await Order.find({ status: "pending" }).sort({
    const orders = await Order.find({ "status.pending": true }).sort({
      createdAt: -1,
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending orders", error });
  }
};

// 3. Get Completed Orders
export const getCompletedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "status.completed": true }).sort({
      createdAt: -1,
    });
    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch completed orders", error });
  }
};

// 4. Get Cancelled Orders
export const getCancelledOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "status.cancelled": true }).sort({
      createdAt: -1,
    });
    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch cancelled orders", error });
  }
};

export const getOneOrders = async (req, res) => {
  console.log("GetOrders controller");

  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId).populate("productId", [
      "name",
      "category",
    ]);
    // console.log(order);
    res.status(200).json(order);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  console.log("CreateOrder controller");
  try {
    // console.log(req.body);
    const totalOrders = await Order.find();
    console.log("totalOrders", totalOrders.length);

    // Generating Order ID
    const today = new Date(); // Current date
    const year = today.getFullYear().toString().slice(-2); // Last two digits of the year
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // Month with leading zero if needed
    const day = today.getDate().toString().padStart(2, "0"); // Day with leading zero if needed
    const CN = req.body.customerName
      .replace(/\s+/g, "")
      .slice(0, 2)
      .toUpperCase();
    const PH = req.body.phone.toString().slice(-3);
    const random = Math.floor(Math.random() * 1000); // Random number between 0 and 999
    const orderCount = totalOrders.length + 1;

    const orderId = `ORD${year}${month}${day}${CN}${PH}00${orderCount}`; // Concatenate date and random number

    console.log("OrderID", orderId);
    const orderData = { ...req.body, orderId };
    // console.log("orderData", orderData);

    let order = await Order.create(orderData);
    order.save();

    // HTML template for invoice
    const html = ORDER_PDF(order.orderId, order);

    // Generate PDF using Puppeteer
    const pdfBuffer = await createOrderPDF(html);

    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    // Email content
    const mailOptions = {
      from: ORDERS_EMAIL, // Sender email address
      to: order.email, // Recipient email address
      cc: INSTANTHUB_GMAIL,
      subject: `Your Order #${orderId} has been placed ${order.customerName}`, // Subject line
      html: ORDER_EMAIL_TEMPLATE(order),
      attachments: [
        {
          filename: `invoice-${order.orderId}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    // Send email
    transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log("Email sent:", info.response);
      })
      .catch((error) => {
        console.log("Error occurred:", error);
      });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Order Received
export const orderReceived = async (req, res) => {
  console.log("orderReceived Controller");
  try {
    console.log(req.body);
    const {
      orderId,
      customerProofFront,
      customerProofBack,
      customerOptional1,
      customerOptional2,
      pickedUpDetails,
      deviceInfo,
      finalPrice,
      status,
    } = req.body;

    const updateObject = {
      customerProofFront,
      customerProofBack,
      pickedUpDetails,
      deviceInfo,
      finalPrice,
      status,
    };

    if (customerOptional1 !== null) {
      updateObject.customerOptional1 = customerOptional1;
    }

    if (customerOptional2 !== null) {
      updateObject.customerOptional2 = customerOptional2;
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateObject, {
      new: true,
    });

    updatedOrder.save();

    console.log("updatedOrder", updatedOrder);

    const stockIn = await Stocks.create({
      orderId: updatedOrder.orderId,
      productDetails: {
        productName: updatedOrder.productName,
        productVariant: updatedOrder.variant.variantName,
        productCategory: updatedOrder.productCategory,
        serialNumber: updatedOrder.deviceInfo.serialNumber,
        imeiNumber: updatedOrder.deviceInfo.imeiNumber,
      },
      customerDetails: {
        customerName: updatedOrder.customerName,
        email: updatedOrder.email,
        phone: updatedOrder.phone,
      },

      pickedUpDetails: updatedOrder.pickedUpDetails,
      status: {
        in: true,
        out: false,
        lost: false,
      },
      purchasePrice: updatedOrder.finalPrice,
    });

    stockIn.save();

    const html = ORDER_RECEIVED_PDF(updatedOrder);

    // Generate PDF using Puppeteer
    const pdfBuffer = await createOrderPDF(html);

    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    // Email content
    const mailOptions = {
      // from: process.env.USER, // Sender email address
      from: ORDERS_EMAIL, // Sender email address
      to: updatedOrder.email, // Recipient email address
      cc: INSTANTHUB_GMAIL, // CC email address (can be a string or an array of strings)
      subject: `Purchase Details for Order ${updatedOrder.orderId}`, // Subject line
      html: ORDER_RECEIVED_TEMPLATE(updatedOrder),
      attachments: [
        {
          filename: `invoice-${updatedOrder.orderId}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    // Send email
    transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log("Email sent:", info.response);
      })
      .catch((error) => {
        console.log("Error occurred:", error);
      });

    res.status(200).json({
      success: true,
      message: "Order Received and Updated",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Cancel Order
export const orderCancel = async (req, res) => {
  console.log("orderCancel controller");
  const orderId = req.params.orderId;
  console.log("orderId", orderId);

  const { status, cancelReason } = req.body;
  console.log("req.body", req.body);
  // console.log("status", status);
  // console.log("cancelReason", cancelReason);

  try {
    const updateOrder = await Order.findByIdAndUpdate(
      orderId, // The ID of the order to update
      { status, cancelReason }, // The fields to update
      { new: true } // Option to return the updated document
    );
    console.log("updateOrder", updateOrder);

    if (!updateOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create transporter
    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    // Email content
    const mailOptions = {
      // from: "instanthub.in@gmail.com", // Sender email address

      from: SUPPORT_EMAIL, // Sender email address
      to: updateOrder.email, // Recipient email address
      cc: INSTANTHUB_GMAIL, // CC email address (can be a string or an array of strings)
      subject: `Your Order #${updateOrder.orderId} has been cancelled ${updateOrder.customerName}`, // Subject line
      // html: emailBody,
      text: ORDER_CANCEL_TEMPLATE(cancelReason),
    };

    // Send email
    transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log("Email sent:", info.response);
      })
      .catch((error) => {
        console.log("Error occurred:", error);
      });

    res
      .status(200)
      .json({ message: "Order cancelled successfully", updateOrder });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while cancelling Order.",
      error,
    });
  }
};

// DELETE Order
export const deleteOrder = async (req, res) => {
  console.log("DeleteOrder controller");
  const orderId = req.params.orderId;
  console.log(orderId);

  try {
    // 1. Delete Order
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    console.log("deleteOrder", deletedOrder);

    // 2. Delete image from uploads/ of the deleted Order
    deleteImage(deletedOrder.customerProofFront);
    deleteImage(deletedOrder.customerProofBack);

    if (deletedOrder.customerOptional1)
      deleteImage(deletedOrder.customerOptional1);
    if (deletedOrder.customerOptional2)
      deleteImage(deletedOrder.customerOptional2);

    // Delete the corresponding image file from the uploads folder
    function deleteImage(image) {
      const __dirname = path.resolve();
      const imagePath = path.join(__dirname, image);
      console.log("imagePath", image);

      try {
        fs.unlink(imagePath, (err) => {
          if (err) {
            if (err.code === "ENOENT") {
              console.log(`Image ${imagePath} does not exist.`);
            } else {
              console.error(`Error deleting image ${imagePath}:`, err);
            }
          } else {
            console.log(`Image ${imagePath} deleted successfully.`);
          }
        });
      } catch (err) {
        console.error(`Error deleting image ${imagePath}:`, err);
      }
    }

    return res.status(201).json(deletedOrder);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error while deleting Order.", error });
  }
};

// Assign Agent
export const assignAgent = async (req, res) => {
  console.log("assignAgent controller");
  const orderId = req.params.orderId;
  // console.log("orderId", orderId);

  const pickedUpDetails = req.body;
  // console.log("req.body", req.body, pickedUpDetails);

  try {
    const updateOrder = await Order.findByIdAndUpdate(
      orderId, // The ID of the order to update
      { pickedUpDetails }, // The fields to update
      { new: true } // Option to return the updated document
    );
    // console.log("updateOrder", updateOrder);

    if (!updateOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    // Email content
    const mailOptions = {
      // from: "instanthub.in@gmail.com", // Sender email address

      from: ORDERS_EMAIL, // Sender email address
      to: updateOrder.email, // Recipient email address
      cc: INSTANTHUB_GMAIL, // CC email address (can be a string or an array of strings)
      subject: `Agent Has Been Assigned To Your Order #${updateOrder.orderId}`, // Subject line
      text: ORDER_ASSIGN_AGENT_TEMPLATE(updateOrder),
    };

    // Send email
    transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log("Email sent:", info.response);
      })
      .catch((error) => {
        console.log("Error occurred:", error);
      });

    res
      .status(200)
      .json({ message: "Agent Assigned successfully", updateOrder });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while cancelling Order.",
      error,
    });
  }
};

// /**
//  * Get all orders categorized by status with counts
//  * @route GET /api/orders/list
//  * @access Private (adjust based on your auth middleware)
//  */
// export const getOrdersList = async (req, res) => {
//   console.log("getOrdersList Controllers");
//   try {
//     // Get today's date range
//     const today = new Date();
//     const startOfDay = new Date(
//       today.getFullYear(),
//       today.getMonth(),
//       today.getDate()
//     );
//     const endOfDay = new Date(
//       today.getFullYear(),
//       today.getMonth(),
//       today.getDate() + 1
//     );

//     // MongoDB aggregation pipeline
//     const ordersData = await Order.aggregate([
//       {
//         $facet: {
//           // Get pending orders
//           pendingOrders: [
//             { $match: { "status.pending": true } },
//             { $sort: { createdAt: -1 } }, // Most recent first
//           ],

//           // Get completed orders
//           completedOrders: [
//             { $match: { "status.completed": true } },
//             { $sort: { createdAt: -1 } },
//           ],

//           // Get cancelled orders
//           cancelledOrders: [
//             { $match: { "status.cancelled": true } },
//             { $sort: { createdAt: -1 } },
//           ],

//           // Get today's orders
//           todaysOrders: [
//             {
//               $match: {
//                 createdAt: {
//                   $gte: startOfDay,
//                   $lt: endOfDay,
//                 },
//               },
//             },
//             { $sort: { createdAt: -1 } },
//           ],

//           // Get counts for each status
//           pendingCount: [
//             { $match: { "status.pending": true } },
//             { $count: "count" },
//           ],

//           completedCount: [
//             { $match: { "status.completed": true } },
//             { $count: "count" },
//           ],

//           cancelledCount: [
//             { $match: { "status.cancelled": true } },
//             { $count: "count" },
//           ],

//           todaysCount: [
//             {
//               $match: {
//                 createdAt: {
//                   $gte: startOfDay,
//                   $lt: endOfDay,
//                 },
//               },
//             },
//             { $count: "count" },
//           ],
//         },
//       },
//       {
//         $project: {
//           orders: {
//             pendingOrders: "$pendingOrders",
//             completedOrders: "$completedOrders",
//             cancelledOrders: "$cancelledOrders",
//             todaysOrders: "$todaysOrders",
//           },
//           counts: {
//             pending: {
//               $ifNull: [{ $arrayElemAt: ["$pendingCount.count", 0] }, 0],
//             },
//             completed: {
//               $ifNull: [{ $arrayElemAt: ["$completedCount.count", 0] }, 0],
//             },
//             cancelled: {
//               $ifNull: [{ $arrayElemAt: ["$cancelledCount.count", 0] }, 0],
//             },
//             today: {
//               $ifNull: [{ $arrayElemAt: ["$todaysCount.count", 0] }, 0],
//             },
//           },
//         },
//       },
//     ]);

//     const result = ordersData[0] || {
//       orders: {
//         pendingOrders: [],
//         completedOrders: [],
//         cancelledOrders: [],
//         todaysOrders: [],
//       },
//       counts: {
//         pending: 0,
//         completed: 0,
//         cancelled: 0,
//         today: 0,
//       },
//     };

//     res.status(200).json({
//       success: true,
//       message: "Orders retrieved successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.error("Error fetching orders list:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to retrieve orders",
//       error: error.message,
//     });
//   }
// };
