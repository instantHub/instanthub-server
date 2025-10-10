import Order from "../models/orderModel.js";
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
  console.log("GetOrdersCounts controller");

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

export const geOrderById = async (req, res) => {
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

// The new, combined controller
export const completeOrderWithProofs = async (req, res) => {
  console.log("completeOrderWithProofs Controller");
  try {
    // 1. Get text data from req.body
    const { orderId, completedAt, deviceInfo, finalPrice, status } = req.body;

    // 2. Get file objects from req.files (provided by multer)
    const files = req.files;

    // Check for required files
    if (!files.customerProofFront || !files.customerProofBack) {
      return res
        .status(400)
        .json({ message: "Front and Back proof images are required." });
    }

    // 3. Construct file paths to store in the DB
    // We prepend a '/' to make it a root-relative URL path
    const customerProofFrontPath = `/${files.customerProofFront[0].path}`;
    const customerProofBackPath = `/${files.customerProofBack[0].path}`;
    const customerOptional1Path = files.customerOptional1
      ? `/${files.customerOptional1[0].path}`
      : null;
    const customerOptional2Path = files.customerOptional2
      ? `/${files.customerOptional2[0].path}`
      : null;

    // 4. Build the update object with the new file paths
    const updateObject = {
      customerIDProof: {
        front: customerProofFrontPath,
        back: customerProofBackPath,
      },
      completedAt,
      deviceInfo: JSON.parse(deviceInfo), // Remember to parse if you stringified on the frontend
      finalPrice,
      status,
    };

    if (customerOptional1Path) {
      updateObject.customerIDProof.optional1 = customerOptional1Path;
    }
    if (customerOptional2Path) {
      updateObject.customerIDProof.optional2 = customerOptional2Path;
    }

    // --- All your existing business logic remains the same ---
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateObject, {
      new: true,
    });

    // You don't need .save() after findByIdAndUpdate with {new: true}
    // updatedOrder.save();

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

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
      status: { in: true, out: false, lost: false },
      purchasePrice: updatedOrder.finalPrice,
    });

    // You don't need .save() after a .create()
    // stockIn.save();

    const html = ORDER_RECEIVED_PDF(updatedOrder);
    const pdfBuffer = await createOrderPDF(html);

    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    const authorizedUser = req.user;

    // Email content
    const mailOptions = {
      from: ORDERS_EMAIL,
      to: updatedOrder.customerDetails.email,
      cc: authorizedUser?.email,
      subject: `Your Order #${updatedOrder.orderId} has been complted ${updatedOrder.customerDetails.name}`,
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
      message: "Order Completed Successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error in completeOrderWithProofs:", error);
    res
      .status(500)
      .json({ message: error.message || "An unexpected error occurred." });
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

/**
 * @route   PUT /api/orders/:id/reschedule
 * @desc    Reschedule an existing order
 * @access  Private (assuming only authenticated users can do this)
 */
export const rescheduleOrder = async (req, res) => {
  console.log("rescheduleOrder controller");

  try {
    // 1. Get the new schedule details from the request body
    const { newDate, newTimeSlot, rescheduleReason } = req.body;
    const { id } = req.params;

    // A simple validation to ensure required fields are sent
    if (!newDate || !newTimeSlot || !rescheduleReason) {
      return res.status(400).json({
        success: false,
        message: "Please provide newDate, newTimeSlot, and rescheduleReason.",
      });
    }

    // 2. Find the existing order by its ID
    const order = await Order.findById(id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // 3. Archive the current schedule details before updating
    const previousSchedule = {
      date: order.schedulePickUp.date,
      timeSlot: order.schedulePickUp.timeSlot,
    };
    order.rescheduleStatus.previousScheduledDates.push(previousSchedule);

    // 4. Update the order document with new information
    // Update the schedule itself
    order.schedulePickUp.date = newDate;
    order.schedulePickUp.timeSlot = newTimeSlot;

    // Update the reschedule tracking status
    order.rescheduleStatus.rescheduled = true;
    order.rescheduleStatus.rescheduleReason = rescheduleReason;
    order.rescheduleStatus.lastRescheduledDate = new Date().toISOString();
    order.rescheduleStatus.rescheduleCount += 1; // Increment the count

    // IMPORTANT: Set who rescheduled the order.
    order.rescheduleStatus.rescheduledBy = req.user?.name || "System"; // Fallback to 'System' if no user

    // 5. Save the updated order to the database
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: "Order rescheduled successfully.",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error rescheduling order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
