import nodemailer from "nodemailer";
import Executive from "../models/executiveModel.js";
import Order from "../models/orderModel.js";
import {
  GMAIL_MAILER,
  HOSTINGER_MAILER,
  INSTANTHUB_GMAIL,
  ORDERS_EMAIL,
  SUPPORT_EMAIL,
} from "../constants/email.js";
import {
  ACCOUNT_CREATION,
  ORDER_ASSIGN_AGENT_TEMPLATE,
} from "../utils/emailTemplates/executive.js";
import mongoose from "mongoose";
import { getDateRanges } from "../utils/getDateRanges.js";
import { generateUniqueID } from "../utils/helper.js";
import { ROLES } from "../constants/auth.js";

/**
 * @desc    Create a new executive
 * @route   POST /api/executives
 * @access  Private (Admin)
 */
export const createExecutive = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, phone, and password are required." });
    }

    const executiveExists = await Executive.findOne({
      $or: [{ email }, { phone }],
    });

    if (executiveExists) {
      return res.status(400).json({
        message: "An executive with this email or phone already exists.",
      });
    }

    const executiveID = generateUniqueID(ROLES.executive);
    const creator = {
      id: req.user.adminID,
      name: req.user.name,
      role: "admin",
    };

    const executive = await Executive.create({
      executiveID,
      name,
      email,
      phone,
      password,
      role: "executive",
      creator,
    });

    const useGmailService = process.env.USE_GMAIL_SERVICE;
    const MAILER = useGmailService ? GMAIL_MAILER : HOSTINGER_MAILER;
    const FROM = useGmailService ? INSTANTHUB_GMAIL : SUPPORT_EMAIL;

    const transporter = nodemailer.createTransport(MAILER);

    const mailOptions = {
      from: FROM,
      to: email,
      subject: `Welcome to Instant Hub: Your Executive Account Details`,
      html: ACCOUNT_CREATION(executive, password),
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

    res.status(201).json(executive);
  } catch (error) {
    console.error("Error creating executive:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get all executives
 * @route   GET /api/executives
 * @access  Private (Admin)
 */
export const getExecutives = async (req, res) => {
  try {
    const executives = await Executive.find({})
      .select("-password -sessionTokens")
      .sort({ createdAt: -1 });
    res.status(200).json(executives);
  } catch (error) {
    console.error("Error fetching executives:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Update an executive
 * @route   PUT /api/executives/:id
 * @access  Private (Admin)
 */
export const updateExecutive = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent password updates through this endpoint
    if (req.body.password) {
      delete req.body.password;
    }

    const updatedExecutive = await Executive.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password -sessionTokens");

    if (!updatedExecutive) {
      return res.status(404).json({ message: "Executive not found." });
    }

    res.status(200).json(updatedExecutive);
  } catch (error) {
    console.error("Error updating executive:", error);
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Email or phone already in use." });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Delete an executive
 * @route   DELETE /api/executives/:id
 * @access  Private (Admin)
 */
export const deleteExecutive = async (req, res) => {
  try {
    const { id } = req.params;
    const executive = await Executive.findByIdAndDelete(id);

    if (!executive) {
      return res.status(404).json({ message: "Executive not found." });
    }

    res.status(200).json({ message: "Executive deleted successfully." });
  } catch (error) {
    console.error("Error deleting executive:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Assign an order to an executive
 * @route   POST /api/executives/assign-order
 * @access  Private (Admin / Executive)
 */
export const assignOrderToExecutive = async (req, res) => {
  try {
    // Here orderId is the object ID not the custom created OrderID
    const { orderId, executiveId, assignmentStatus } = req.body;
    console.log("req.body", req.body);

    const executive = await Executive.findById(executiveId);
    if (!executive) {
      return res.status(404).json({ message: "Executive not found." });
    }
    console.log("executive", executive.name);

    // Find Order and update its status
    const updateOrder = await Order.findByIdAndUpdate(
      orderId,
      { assignmentStatus },
      { new: true }
    );
    if (!updateOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    console.log("updateOrder status", updateOrder.assignmentStatus);

    // Remove this order from all other executives
    await Executive.updateMany(
      {
        "assignedOrders.orderObjectId": updateOrder._id,
        _id: { $ne: executiveId },
      },
      {
        $pull: { assignedOrders: { orderObjectId: updateOrder._id } },
      }
    );

    // Check if the order is already assigned
    const alreadyAssigned = executive.assignedOrders.some(
      (assignment) =>
        assignment.orderObjectId?.toString() === updateOrder._id.toString() ||
        assignment.orderId === updateOrder.orderId
    );

    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: "Order already assigned to this executive",
      });
    }

    // Add order to executive's assigned orders
    executive.assignedOrders.push({
      orderObjectId: updateOrder._id,
      orderId: updateOrder.orderId,
      assignedAt: new Date(),
    });
    await executive.save();

    const useGmailService = process.env.USE_GMAIL_SERVICE;
    const MAILER = useGmailService ? GMAIL_MAILER : HOSTINGER_MAILER;
    const FROM = useGmailService ? INSTANTHUB_GMAIL : ORDERS_EMAIL;

    const transporter = nodemailer.createTransport(MAILER);

    // Email content
    const mailOptions = {
      from: FROM,
      to: updateOrder.customerDetails.email,
      cc: executive.email,
      subject: `Agent Has Been Assigned To Your Order #${updateOrder.orderId}`,
      html: ORDER_ASSIGN_AGENT_TEMPLATE(updateOrder, executive),
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
      message: `Order ${updateOrder.orderId} assigned to ${executive.name} successfully.`,
      executive,
    });
  } catch (error) {
    console.error("Error assigning order:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Assign an order to an executive
 * @route   POST /api/executives/orders
 * @access  Private (Admin / Executive)
 */
export const getExecutiveOrders = async (req, res) => {
  try {
    const { id } = req.user;

    const executive = await Executive.findById(id)
      .populate("assignedOrders.orderObjectId")
      .lean();

    const orders = executive.assignedOrders
      .map((a) => a.orderObjectId)
      .filter(Boolean);

    if (!executive) {
      return res.status(404).json({
        success: false,
        message: "Executive not found",
      });
    }

    res.status(200).json({
      message: "Success",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching executives:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch executives with orders",
    });
  }
};

/**
 * @desc    Get count of pending, completed, cancelled orders for all executives
 * @route   GET /api/executive/orders/count
 * @access  Private (Admin / Executive)
 */
export const getExecutiveOrderCounts = async (req, res) => {
  try {
    const { id } = req.params;

    // --- Date ranges remain the same ---
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);

    const dayAfterTomorrowStart = new Date(tomorrowStart);
    dayAfterTomorrowStart.setDate(tomorrowStart.getDate() + 1);

    // --- Mongoose query remains the same ---
    const executive = await Executive.findById(id)
      .populate({
        path: "assignedOrders.orderObjectId",
        model: "Order",
        select: "status schedulePickUp.date",
      })
      .lean();

    if (!executive) {
      return res
        .status(404)
        .json({ success: false, message: "Executive not found" });
    }

    // 1. Updated structure for the counters
    const counts = {
      overall: { total: 0, pending: 0, completed: 0, cancelled: 0 },
      today: { total: 0, pending: 0, completed: 0, cancelled: 0 },
      tomorrow: { total: 0 },
    };

    // 2. Updated counting logic
    executive.assignedOrders.forEach((assigned) => {
      const order = assigned.orderObjectId;
      if (!order) return;

      const status = order.status;

      // Update overall counts
      counts.overall.total++;
      if (status && counts.overall.hasOwnProperty(status)) {
        counts.overall[status]++;
      }

      // Check date and update time-specific counts
      const scheduleDate = order.schedulePickUp?.date;
      if (scheduleDate) {
        // Check if the order is for today
        if (scheduleDate >= todayStart && scheduleDate < tomorrowStart) {
          counts.today.total++;
          // Also update today's status breakdown
          if (status && counts.today.hasOwnProperty(status)) {
            counts.today[status]++;
          }
        }
        // Check if the order is for tomorrow
        else if (
          scheduleDate >= tomorrowStart &&
          scheduleDate < dayAfterTomorrowStart
        ) {
          counts.tomorrow.total++;
        }
      }
    });

    res.status(200).json({ success: true, data: counts });
  } catch (error) {
    console.error("Error fetching order counts:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Get orders of a specific status (pending/completed/cancelled) for an executive
 * @route   GET /api/executives/:id/:status/orders
 *  @access  Private (Admin / Executive)
 */
export const getExecutiveOrdersByStatus = async (req, res) => {
  try {
    const { id, status } = req.params;

    const executive = await Executive.findById(id)
      .populate({
        path: "assignedOrders.orderObjectId",
        // select: "orderId status customerDetails",
      })
      .lean();

    if (!executive) {
      return res.status(404).json({
        success: false,
        message: "Executive not found",
      });
    }

    // Filter assignedOrders by order.status
    const filteredOrders = executive.assignedOrders.filter(
      (assigned) => assigned.orderObjectId?.status === status
    );

    res.status(200).json({ success: true, data: filteredOrders });
  } catch (error) {
    console.error("Error fetching executive orders by status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Get assigned orders scheduled for today
 * @route   GET /api/executives/schedule-orders?day=tomorrow
 * @access  Private (Executive)
 */
export const getExecutiveScheduledOrders = async (req, res) => {
  try {
    const { id } = req.user;
    const { day } = req.query; // e.g., ?day=yesterday or ?day=week

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid executive ID." });
    }

    const DateRangeCalculators = {
      today: () => {
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        return { startDate, endDate };
      },
      tomorrow: () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 1);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(23, 59, 59, 999);
        return { startDate, endDate };
      },
      yesterday: () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        return { startDate, endDate };
      },
      week: () => {
        const now = new Date();
        const currentDayOfWeek = now.getDay(); // Sunday - 0, Saturday - 6
        const firstDay = now.getDate() - currentDayOfWeek;

        const startDate = new Date(now.setDate(firstDay));
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        return { startDate, endDate };
      },
    };

    // 1. Select the correct calculator function from the map, or default to 'today'
    const calculateDateRange =
      DateRangeCalculators[day] || DateRangeCalculators.today;

    // 2. Execute the function to get the date range
    const { startDate, endDate } = calculateDateRange();

    // 3. The aggregation pipeline remains the same
    const executiveOrders = await Executive.aggregate([
      // ... (the rest of your aggregation pipeline is unchanged)
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      { $unwind: "$assignedOrders" },
      {
        $lookup: {
          from: "orders",
          localField: "assignedOrders.orderObjectId",
          foreignField: "_id",
          as: "orderDetails",
        },
      },
      { $unwind: "$orderDetails" },
      {
        $match: {
          "orderDetails.schedulePickUp.date": {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      { $replaceRoot: { newRoot: "$orderDetails" } },
    ]);

    res.status(200).json({
      success: true,
      count: executiveOrders.length,
      data: executiveOrders,
    });
  } catch (error) {
    console.error("Error fetching scheduled orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Get all assigned orders, grouped by status
 * @route   GET /api/executives/my-orders-by-status
 * @access  Private (Executive)
 */
export const getOrdersByStatus = async (req, res) => {
  try {
    // Ensure the ID is a valid MongoDB ObjectId
    const executiveId = new mongoose.Types.ObjectId(req.user.id);

    const pipeline = [
      // Stage 1: Filter to get only the orders for the specific executive
      {
        $match: {
          assignedExecutive: executiveId,
        },
      },
      // Stage 2: Group the documents by the 'status' field
      {
        $group: {
          _id: "$status", // Group by the value of the 'status' field
          count: { $sum: 1 }, // Count the number of orders in each group
          orders: { $push: "$$ROOT" }, // Push the full order document into an array
        },
      },
      // Stage 3: (Optional) Reshape the output for a cleaner look
      {
        $project: {
          _id: 0, // Exclude the default _id field
          status: "$_id", // Rename _id to 'status'
          count: 1, // Include the count
          orders: 1, // Include the array of orders
        },
      },
    ];

    const groupedOrders = await Order.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: groupedOrders,
    });
  } catch (error) {
    console.error("Error fetching orders by status:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching orders by status." });
  }
};

// controllers/executiveStatsController.js

/**
 * Get order statistics for logged-in executive
 * @route GET /api/executive/orders/stats
 * @access Private (Executive only)
 */
export const getExecutiveOrderStats = async (req, res) => {
  try {
    const executiveId = req.user._id; // From auth middleware
    const executiveName = req.user.name; // From auth middleware

    const { todayStart, todayEnd, tomorrowStart, tomorrowEnd, weekAgo } =
      getDateRanges();

    // Base query - orders assigned to this executive by name
    const baseQuery = {
      "assignmentStatus.assigned": true,
      "assignmentStatus.assignedTo.name": executiveName,
    };

    // Execute all queries in parallel
    const [
      // Overall counts
      totalAssigned,
      pendingOrders,
      completedOrders,
      overdueOrders,
      inProgressOrders,

      // Today's counts
      todayTotal,
      todayPending,
      todayCompleted,
      todayOverdue,

      // Tomorrow's counts
      tomorrowTotal,
      tomorrowPending,

      // Weekly performance
      weeklyCompleted,

      // Get executive details
      executive,
    ] = await Promise.all([
      // Overall
      Order.countDocuments(baseQuery),
      Order.countDocuments({
        ...baseQuery,
        status: "pending",
      }),
      Order.countDocuments({
        ...baseQuery,
        status: "completed",
      }),
      Order.countDocuments({
        ...baseQuery,
        "schedulePickUp.date": { $lt: todayStart },
        status: { $nin: ["completed", "cancelled"] },
      }),
      Order.countDocuments({
        ...baseQuery,
        status: "in-progress",
      }),

      // Today
      Order.countDocuments({
        ...baseQuery,
        "schedulePickUp.date": { $gte: todayStart, $lte: todayEnd },
      }),
      Order.countDocuments({
        ...baseQuery,
        "schedulePickUp.date": { $gte: todayStart, $lte: todayEnd },
        status: "pending",
      }),
      Order.countDocuments({
        ...baseQuery,
        "schedulePickUp.date": { $gte: todayStart, $lte: todayEnd },
        status: "completed",
      }),
      Order.countDocuments({
        ...baseQuery,
        "schedulePickUp.date": { $gte: todayStart, $lt: todayStart },
        status: { $nin: ["completed", "cancelled"] },
      }),

      // Tomorrow
      Order.countDocuments({
        ...baseQuery,
        "schedulePickUp.date": { $gte: tomorrowStart, $lte: tomorrowEnd },
      }),
      Order.countDocuments({
        ...baseQuery,
        "schedulePickUp.date": { $gte: tomorrowStart, $lte: tomorrowEnd },
        status: "pending",
      }),

      // Last 7 days completed
      Order.countDocuments({
        ...baseQuery,
        status: "completed",
        completedAt: { $gte: weekAgo },
      }),

      // Executive details
      Executive.findById(executiveId).select(
        "name rating totalCompletedOrders"
      ),
    ]);

    const result = {
      executive: {
        name: executive?.name || executiveName,
        rating: executive?.rating || 1,
        totalCompleted: executive?.totalCompletedOrders || 0,
      },
      overall: {
        totalAssigned,
        pending: pendingOrders,
        completed: completedOrders,
        overdue: overdueOrders,
        inProgress: inProgressOrders,
      },
      today: {
        total: todayTotal,
        pending: todayPending,
        completed: todayCompleted,
        overdue: todayOverdue,
      },
      tomorrow: {
        total: tomorrowTotal,
        pending: tomorrowPending,
      },
      performance: {
        weeklyCompleted,
        completionRate:
          totalAssigned > 0
            ? ((completedOrders / totalAssigned) * 100).toFixed(1)
            : "0",
      },
    };

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching executive stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch executive statistics",
      error: error.message,
    });
  }
};

/**
 * Get orders assigned to logged-in executive with filtering
 * @route GET /api/executive/orders?status=pending&dateFilter=today&page=1&limit=20
 * @access Private (Executive only)
 */
export const getExecutiveOrders2 = async (req, res) => {
  try {
    const executiveId = req.user._id;
    const executiveName = req.user.name;

    const {
      status,
      dateFilter,
      page = 1,
      limit = 20,
      sortBy = "schedulePickUp.date",
      order = "asc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "desc" ? -1 : 1;

    // Base query - only orders assigned to this executive
    let matchQuery = {
      "assignmentStatus.assigned": true,
      "assignmentStatus.assignedTo.name": executiveName,
    };

    // Validate and handle status filter
    const validStatuses = [
      "pending",
      "completed",
      "overdue",
      "cancelled",
      "in-progress",
      "all",
    ];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const { todayStart, todayEnd, tomorrowStart, tomorrowEnd } =
      getDateRanges();

    // Handle status filter
    if (status === "overdue") {
      matchQuery["schedulePickUp.date"] = { $lt: todayStart };
      matchQuery.status = { $nin: ["completed", "cancelled"] };
    } else if (status && status !== "all") {
      matchQuery.status = status;
    }

    // Handle date filter
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

    // Build sort object
    let sortObject = {};
    sortObject[sortBy] = sortOrder;
    if (sortBy !== "createdAt") {
      sortObject.createdAt = -1; // Secondary sort
    }

    // Execute queries in parallel
    const [orders, totalCount] = await Promise.all([
      Order.find(matchQuery)
        .sort(sortObject)
        .skip(skip)
        .limit(parseInt(limit))
        .select({
          orderId: 1,
          customerDetails: 1,
          productDetails: 1,
          deviceInfo: 1,
          status: 1,
          schedulePickUp: 1,
          offerPrice: 1,
          finalPrice: 1,
          paymentMode: 1,
          assignmentStatus: 1,
          rescheduleStatus: 1,
          customerIDProof: 1,
          createdAt: 1,
          completedAt: 1,
        })
        .lean(),
      Order.countDocuments(matchQuery),
    ]);

    // Format orders with overdue flag
    const formattedOrders = orders.map((order) => {
      const isOverdue =
        order.schedulePickUp?.date &&
        new Date(order.schedulePickUp.date) < todayStart &&
        !["completed", "cancelled"].includes(order.status);

      return {
        id: order._id.toString(),
        orderId: order.orderId,
        customer: {
          name: order.customerDetails?.name || "N/A",
          email: order.customerDetails?.email || "N/A",
          phone: order.customerDetails?.phone?.toString() || "N/A",
          address: order.customerDetails?.addressDetails?.address || "N/A",
          city: order.customerDetails?.addressDetails?.city || "N/A",
          state: order.customerDetails?.addressDetails?.state || "N/A",
          pinCode:
            order.customerDetails?.addressDetails?.pinCode?.toString() || "N/A",
        },
        product: {
          name: order.productDetails?.productName || "N/A",
          brand: order.productDetails?.productBrand || "N/A",
          category: order.productDetails?.productCategory || "N/A",
          variant: order.productDetails?.variant?.variantName || "N/A",
          variantPrice: order.productDetails?.variant?.price || 0,
        },
        device: {
          serialNumber: order.deviceInfo?.serialNumber || null,
          imeiNumber: order.deviceInfo?.imeiNumber || null,
        },
        status: order.status,
        isOverdue,
        scheduledDate: order.schedulePickUp?.date || null,
        timeSlot: order.schedulePickUp?.timeSlot || "N/A",
        offerPrice: order.offerPrice || 0,
        finalPrice: order.finalPrice || null,
        paymentMode: order.paymentMode || "N/A",
        reschedule: {
          isRescheduled: order.rescheduleStatus?.rescheduled || false,
          rescheduleCount: order.rescheduleStatus?.rescheduleCount || 0,
          rescheduleReason: order.rescheduleStatus?.rescheduleReason || null,
        },
        hasProofs: !!(
          order.customerIDProof?.front && order.customerIDProof?.back
        ),
        createdAt: order.createdAt,
        completedAt: order.completedAt || null,
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
          status: status || "all",
          dateFilter: dateFilter || "all",
          sortBy,
          order,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching executive orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};
