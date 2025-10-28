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
  ORDER_RESCHEDULED_TEMPLATE,
} from "../utils/emailTemplates/orders.js";
import { createOrderPDF } from "../utils/pdf.creation.js";
import { deleteImage } from "../utils/deleteImage.js";
import { getDateRanges } from "../utils/getDateRanges.js";
import { ORDER_STATUS } from "../constants/orders.js";

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
      subject: `Your Order #${updatedOrder.orderId} has been completed ${updatedOrder.customerDetails.name}`,
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
 * @route   PUT /api/orders/:id/reopen
 * @desc    ReOpen an cancelled order
 * @access  Private (assuming only authenticated users can do this)
 */
export const orderReopen = async (req, res) => {
  console.log("orderReopen controller");

  try {
    // 1. Get the Object id of the order from params
    const { id } = req.params;

    // 2. Find the existing order by its ID and update status to 'pending'
    const order = await Order.findByIdAndUpdate(
      id,
      { status: ORDER_STATUS.PENDING },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // 3. Save the updated order to the database
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: "Order reopened successfully.",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error rescheduling order:", error);
    res.status(500).json({ success: false, message: "Server error" });
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

    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    const authorizedUser = req.user;

    // Email content
    const mailOptions = {
      from: ORDERS_EMAIL,
      to: updatedOrder.customerDetails.email,
      cc: authorizedUser?.email,
      subject: `Your Order #${updatedOrder.orderId} has been rescheduled ${updatedOrder.customerDetails.name}`,
      html: ORDER_RESCHEDULED_TEMPLATE(updatedOrder),
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
      message: "Order rescheduled successfully.",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error rescheduling order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get comprehensive order statistics using parallel queries
 * @route GET /api/orders/stats
 * @access Private
 */
export const getOrderStats = async (req, res) => {
  try {
    const { todayStart, todayEnd, tomorrowStart, tomorrowEnd } =
      getDateRanges();

    const locationStatsPipeline = [
      {
        // Find only pending orders to aggregate
        $match: { status: "pending" },
      },
      {
        // Group by city
        $group: {
          _id: "$customerDetails.addressDetails.city",
          totalPending: { $sum: 1 },
          todayPending: {
            // Conditionally sum if the order is today
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$schedulePickUp.date", todayStart] },
                    { $lte: ["$schedulePickUp.date", todayEnd] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        // Project to a cleaner format
        $project: {
          _id: 0,
          location: "$_id",
          totalPending: 1,
          todayPending: 1,
        },
      },
      {
        // Filter out null/empty locations
        $match: { location: { $ne: null, $ne: "" } },
      },
      {
        // Sort by location name
        $sort: { location: 1 },
      },
    ];

    // Execute all queries in parallel
    const [
      // Overall counts
      overallTotal,
      overallPending,
      overallCompleted,
      overallCancelled,
      overallUnassigned,
      overallOverdue,

      // Today's counts
      todayTotal,
      todayPending,
      todayCompleted,
      todayCancelled,
      todayUnassigned,

      // Tomorrow's counts
      tomorrowTotal,
      tomorrowUnassigned,

      // Location stats query
      locationStats,
    ] = await Promise.all([
      // Overall
      Order.countDocuments({}),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "completed" }),
      Order.countDocuments({ status: "cancelled" }),
      Order.countDocuments({
        "assignmentStatus.assigned": false,
        status: { $nin: ["completed", "cancelled"] },
      }),

      // Overdue orders: scheduled date is before today and not completed/cancelled
      Order.countDocuments({
        "schedulePickUp.date": { $lt: todayStart },
        status: { $nin: ["completed", "cancelled"] },
      }),

      // Today
      Order.countDocuments({
        "schedulePickUp.date": { $gte: todayStart, $lte: todayEnd },
      }),
      Order.countDocuments({
        "schedulePickUp.date": { $gte: todayStart, $lte: todayEnd },
        status: "pending",
      }),
      Order.countDocuments({
        "schedulePickUp.date": { $gte: todayStart, $lte: todayEnd },
        status: "completed",
      }),
      Order.countDocuments({
        "schedulePickUp.date": { $gte: todayStart, $lte: todayEnd },
        status: "cancelled",
      }),
      Order.countDocuments({
        "schedulePickUp.date": { $gte: todayStart, $lte: todayEnd },
        "assignmentStatus.assigned": false,
        status: { $nin: ["completed", "cancelled"] },
      }),

      // Tomorrow
      Order.countDocuments({
        "schedulePickUp.date": { $gte: tomorrowStart, $lte: tomorrowEnd },
      }),
      Order.countDocuments({
        "schedulePickUp.date": { $gte: tomorrowStart, $lte: tomorrowEnd },
        "assignmentStatus.assigned": false,
        status: { $nin: ["completed", "cancelled"] },
      }),

      // New query to the array
      Order.aggregate(locationStatsPipeline),
    ]);

    const result = {
      overall: {
        total: overallTotal,
        pending: overallPending,
        completed: overallCompleted,
        cancelled: overallCancelled,
        unassigned: overallUnassigned,
        overdue: overallOverdue,
      },
      today: {
        total: todayTotal,
        pending: todayPending,
        completed: todayCompleted,
        cancelled: todayCancelled,
        unassigned: todayUnassigned,
      },
      tomorrow: {
        total: tomorrowTotal,
        unassigned: tomorrowUnassigned,
      },

      // New locationStats to the response
      locationStats: locationStats,
    };

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order statistics",
      error: error.message,
    });
  }
};

/**
 * Get orders by status with optional date filtering
 * @route GET /api/orders/by-status?status=pending&dateFilter=today&page=1&limit=20
 * @access Private
 */
export const getOrdersByStatus = async (req, res) => {
  console.log("getOrdersByStatus controller");

  try {
    const {
      status,
      dateFilter,
      location,
      search = "",
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;
    console.log("req.query", req.query);

    // Validate status parameter
    const validStatuses = [
      "pending",
      "completed",
      "cancelled",
      "in-progress",
      "unassigned",
      "overdue",
      "all",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status parameter is required and must be one of: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    const { todayStart, todayEnd, tomorrowStart, tomorrowEnd } =
      getDateRanges();

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "desc" ? -1 : 1;

    // Build match query
    let matchQuery = {};

    // Handle status filter
    if (status === "unassigned") {
      matchQuery = {
        "assignmentStatus.assigned": false,
        status: { $nin: ["completed", "cancelled"] },
      };
    } else if (status === "overdue") {
      // Overdue: scheduled date is before today and not completed/cancelled
      console.log("overdue orders filter applied");

      // const todayStart = new Date();
      // todayStart.setHours(0, 0, 0, 0);

      matchQuery = {
        "schedulePickUp.date": { $lt: todayStart },
        status: { $nin: ["completed", "cancelled"] },
      };
    } else if (status !== "all") {
      matchQuery.status = status;
    }

    // --- // NEW Location Filter ---
    if (location && location !== "all") {
      matchQuery["customerDetails.addressDetails.city"] = location;
    }

    // Handle date filter
    if (dateFilter) {
      // const { todayStart, todayEnd, tomorrowStart, tomorrowEnd } =
      //   getDateRanges();

      if (dateFilter === "today") {
        matchQuery["schedulePickUp.date"] = {
          $gte: todayStart,
          $lte: todayEnd,
        };
      } else if (dateFilter === "tomorrow") {
        matchQuery["schedulePickUp.date"] = {
          $gte: tomorrowStart,
          $lte: tomorrowEnd,
        };
      }
    }

    // Search Filter (NEW)
    if (search && search.trim()) {
      const searchTerm = search.trim();
      const escapedSearch = searchTerm.replace(
        /[-\/\\^$*+?.()|[\]{}]/g,
        "\\$&"
      );
      const searchRegex = new RegExp(escapedSearch, "i");

      // Check if search term is purely numeric
      const isNumeric = /^\d+$/.test(searchTerm);

      matchQuery.$or = [
        { orderId: searchRegex }, // Works for "1394" in "MB25100971394"
        { "customerDetails.name": searchRegex },
        { "customerDetails.addressDetails.city": searchRegex },
        { "customerDetails.addressDetails.state": searchRegex },
      ];

      // If numeric, also search by phone (stored as Number) and pincode
      if (isNumeric) {
        const numericValue = parseInt(searchTerm);

        // For phone number (stored as Number in DB)
        matchQuery.$or.push({ "customerDetails.phone": numericValue });

        // For pincode (if stored as String)
        matchQuery.$or.push({
          "customerDetails.addressDetails.pinCode": searchTerm,
        });
      }
    }

    // Execute queries in parallel
    const [orders, totalCount] = await Promise.all([
      Order.aggregate([
        { $match: matchQuery },
        { $sort: { [sortBy]: sortOrder } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $project: {
            orderId: 1,
            customerName: "$customerDetails.name",
            customerEmail: "$customerDetails.email",
            customerPhone: "$customerDetails.phone",
            customerAddress: "$customerDetails.addressDetails.address",
            customerCity: "$customerDetails.addressDetails.city",
            customerState: "$customerDetails.addressDetails.state",
            customerPinCode: "$customerDetails.addressDetails.pinCode",
            status: 1,
            scheduledDate: "$schedulePickUp.date",
            timeSlot: "$schedulePickUp.timeSlot",
            finalPrice: 1,
            offerPrice: 1,
            paymentMode: 1,
            productName: "$productDetails.productName",
            productBrand: "$productDetails.productBrand",
            productCategory: "$productDetails.productCategory",
            variantName: "$productDetails.variant.variantName",
            variantPrice: "$productDetails.variant.price",
            serialNumber: "$deviceInfo.serialNumber",
            imeiNumber: "$deviceInfo.imeiNumber",
            assignmentStatus: 1,
            rescheduleStatus: 1,
            cancellationDetails: 1,
            createdAt: 1,
            completedAt: 1,
          },
        },
      ]),
      // NEW location based
      // Order.aggregate([
      //   { $match: matchQuery },
      //   { $sort: { [sortBy]: sortOrder } },
      // ]),
      Order.countDocuments(matchQuery),
    ]);

    // Format response with overdue indicator
    // const todayStart = new Date();
    // todayStart.setHours(0, 0, 0, 0);

    const formattedOrders = orders.map((order) => {
      const isOverdue =
        new Date(order.scheduledDate) < todayStart &&
        !["completed", "cancelled"].includes(order.status);

      return {
        id: order._id,
        orderId: order.orderId,

        // Customer details
        customer: {
          name: order.customerName || "N/A",
          email: order.customerEmail || "N/A",
          phone: order.customerPhone || "N/A",
          address: order.customerAddress || "N/A",
          city: order.customerCity || "N/A",
          state: order.customerState || "N/A",
          pinCode: order.customerPinCode || "N/A",
        },

        // Product details
        product: {
          name: order.productName || "N/A",
          brand: order.productBrand || "N/A",
          category: order.productCategory || "N/A",
          variant: order.variantName || "N/A",
          variantPrice: order.variantPrice || 0,
        },

        // Device info
        device: {
          serialNumber: order.serialNumber || "N/A",
          imeiNumber: order.imeiNumber || "N/A",
        },

        // Order details
        status: order.status,
        isOverdue: isOverdue,
        scheduledDate: order.scheduledDate,
        timeSlot: order.timeSlot || "N/A",
        offerPrice: order.offerPrice || 0,
        finalPrice: order.finalPrice || 0,
        paymentMode: order.paymentMode || "N/A",

        // Assignment details
        assignment: {
          isAssigned: order.assignmentStatus?.assigned || false,
          assignedTo: order.assignmentStatus?.assignedTo?.name || null,
          assignedToPhone: order.assignmentStatus?.assignedTo?.phone || null,
          assignedToRole: order.assignmentStatus?.assignedTo?.role || null,
          assignedAt: order.assignmentStatus?.assignedAt || null,
          assignedBy: order.assignmentStatus?.assignedBy?.name || null,
        },

        // Reschedule details
        reschedule: {
          isRescheduled: order.rescheduleStatus?.rescheduled || false,
          rescheduleCount: order.rescheduleStatus?.rescheduleCount || 0,
          rescheduleReason: order.rescheduleStatus?.rescheduleReason || null,
          lastRescheduledDate:
            order.rescheduleStatus?.lastRescheduledDate || null,
        },

        // Cancellation details
        cancellation:
          order.status === "cancelled"
            ? {
                cancelledBy: order.cancellationDetails?.cancelledBy || null,
                cancelReason: order.cancellationDetails?.cancelReason || null,
                cancelledAt: order.cancellationDetails?.cancelledAt || null,
              }
            : null,

        // Timestamps
        createdAt: order.createdAt,
        completedAt: order.completedAt,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalOrders: totalCount,
          ordersPerPage: parseInt(limit),
          hasNextPage: skip + formattedOrders.length < totalCount,
          hasPrevPage: parseInt(page) > 1,
        },
        filters: {
          status: status,
          dateFilter: dateFilter || "all",
          location: location || "all", // <-- Add location to filters response
          sortBy: sortBy,
          order: order,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching orders by status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};
