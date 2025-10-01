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
import { ORDER_STATUS } from "../constants/orders.js";
import { deleteImage } from "../utils/deleteImage.js";

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
      Order.countDocuments({ status: ORDER_STATUS.PENDING }),
      Order.countDocuments({ status: ORDER_STATUS.COMPLETED }),
      Order.countDocuments({ status: ORDER_STATUS.CANCELLED }),

      Order.countDocuments({
        status: ORDER_STATUS.PENDING,
        createdAt: { $gte: utcStartOfDay, $lte: utcEndOfDay },
      }),
      Order.countDocuments({
        status: ORDER_STATUS.COMPLETED,
        createdAt: { $gte: utcStartOfDay, $lte: utcEndOfDay },
      }),
      Order.countDocuments({
        status: "cancelled",
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
    const orders = await Order.find({ status: ORDER_STATUS.PENDING }).sort({
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
    const orders = await Order.find({ status: ORDER_STATUS.COMPLETED }).sort({
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
    const orders = await Order.find({ status: ORDER_STATUS.CANCELLED }).sort({
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
      "uniqueURL",
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
    const CN = req.body.customerDetails.name
      .replace(/\s+/g, "")
      .slice(0, 2)
      .toUpperCase();
    const PH = req.body.customerDetails.phone.toString().slice(-3);
    const random = Math.floor(Math.random() * 1000); // Random number between 0 and 999
    const orderCount = totalOrders.length + 1;

    // TODO: New Order ID creation request needs to be implemented
    const MOBILE_CODE = "MB";
    const LAPTOP_CODE = "LP";
    const TABLET_CODE = "TB";
    const DESKTOP_CODE = "DT";
    const DSLR_CODE = "DS";

    const codeMapping = {
      mobile: MOBILE_CODE,
      laptop: LAPTOP_CODE,
      tablet: TABLET_CODE,
      desktop: DESKTOP_CODE,
      dslr: DSLR_CODE,
    };

    const categoryCode = req.body.productDetails.productCategory
      ? codeMapping[req.body.productDetails.productCategory.toLowerCase()]
      : "OT";

    const orderId = `${categoryCode}${year}${month}${PH}${orderCount}`;

    // MOBILE_CODE - YEAR - MONTH - PH - ORDER_COUNT
    // MP2509971001

    // const orderId = `ORD${year}${month}${day}${CN}${PH}00${orderCount}`; // Concatenate date and random number

    console.log("OrderID", orderId);
    const orderData = { ...req.body, orderId };
    // console.log("orderData", orderData);

    let order = await Order.create(orderData);
    order.save();

    // HTML template for invoice
    const html = ORDER_PDF(order);

    // Generate PDF using Puppeteer
    const pdfBuffer = await createOrderPDF(html);

    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    // Email content
    const mailOptions = {
      from: ORDERS_EMAIL, // Sender email address
      to: order.customerDetails.email, // Recipient email address
      cc: INSTANTHUB_GMAIL,
      subject: `Your Order #${orderId} has been placed ${order.customerDetails.name}`, // Subject line
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
      // pickedUpDetails,
      completedAt,
      deviceInfo,
      finalPrice,
      status,
    } = req.body;

    const updateObject = {
      customerIDProof: {
        front: customerProofFront,
        back: customerProofBack,
      },
      // pickedUpDetails,
      completedAt,
      deviceInfo,
      finalPrice,
      status,
    };

    if (customerOptional1 !== null) {
      updateObject.customerIDProof.optional1 = customerOptional1;
    }

    if (customerOptional2 !== null) {
      updateObject.customerIDProof.optional2 = customerOptional2;
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateObject, {
      new: true,
    });

    updatedOrder.save();

    console.log("updatedOrder", updatedOrder);

    const stockIn = await Stocks.create({
      orderId: updatedOrder.orderId,
      productDetails: {
        productName: updatedOrder.productDetails.productName,
        productVariant: updatedOrder.productDetails.variant.variantName,
        productCategory: updatedOrder.productDetails.productCategory,
        serialNumber: updatedOrder.deviceInfo.serialNumber,
        imeiNumber: updatedOrder.deviceInfo.imeiNumber,
      },
      customerDetails: {
        customerName: updatedOrder.customerDetails.name,
        email: updatedOrder.customerDetails.email,
        phone: updatedOrder.customerDetails.phone,
      },

      // pickedUpDetails: updatedOrder.pickedUpDetails,
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
      to: updatedOrder.customerDetails.email, // Recipient email address
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

  const { status, cancellationDetails } = req.body;
  console.log("req.body", req.body);
  // console.log("status", status);
  // console.log("cancelReason", cancelReason);

  try {
    const updateOrder = await Order.findByIdAndUpdate(
      orderId, // The ID of the order to update
      { status, cancellationDetails }, // The fields to update
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
      to: updateOrder.customerDetails.email, // Recipient email address
      cc: INSTANTHUB_GMAIL, // CC email address (can be a string or an array of strings)
      subject: `Your Order #${updateOrder.orderId} has been cancelled ${updateOrder.customerDetails.name}`, // Subject line
      // html: emailBody,
      text: ORDER_CANCEL_TEMPLATE(cancellationDetails.cancelReason),
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
    if (deletedOrder.customerIDProof.front)
      deleteImage(deletedOrder.customerIDProof.front);
    if (deletedOrder.customerIDProof.back)
      deleteImage(deletedOrder.customerIDProof.back);

    if (deletedOrder.customerIDProof.optional1)
      deleteImage(deletedOrder.customerIDProof.optional1);
    if (deletedOrder.customerIDProof.optional2)
      deleteImage(deletedOrder.customerIDProof.optional2);

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

  const { assignmentStatus } = req.body;
  console.log("req.body", assignmentStatus);

  try {
    const updateOrder = await Order.findByIdAndUpdate(
      orderId, // The ID of the order to update
      { assignmentStatus }, // The fields to update
      { new: true } // Option to return the updated document
    );
    // console.log("updateOrder", updateOrder);

    if (!updateOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    // Email content
    const mailOptions = {
      from: ORDERS_EMAIL, // Sender email address
      to: updateOrder.customerDetails.email, // Recipient email address
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
