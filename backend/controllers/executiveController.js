import nodemailer from "nodemailer";
import Executive from "../models/executiveModel.js";
import Order from "../models/orderModel.js";
import {
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
      // return res.status(409).json({
      return res.status(400).json({
        message: "An executive with this email or phone already exists.",
      });
    }

    const executive = await Executive.create({
      name,
      email,
      phone,
      password,
    });

    // Email Password to the created executive
    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    const mailOptions = {
      from: SUPPORT_EMAIL,
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

    const transporter = nodemailer.createTransport(HOSTINGER_MAILER);

    // Email content
    const mailOptions = {
      from: ORDERS_EMAIL, // Sender email address
      to: updateOrder.customerDetails.email, // Recipient email address
      cc: executive.email, // CC email address (can be a string or an array of strings)
      subject: `Agent Has Been Assigned To Your Order #${updateOrder.orderId}`, // Subject line
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
