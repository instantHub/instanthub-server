import Order from "../../models/orderModel.js";
import Partner from "../../models/partner/partner.model.js";

/**
 * Get orders by status with optional date filtering
 * @route GET /api/partners-orders/location
 * @access Private (Partner / Partner_Executive)
 */
export const getOrdersByLocation = async (req, res) => {
  console.log("getOrdersByLocation controller");

  try {
    /**
     *  1. Get the logged-in partner's data from the request object
     *  NOTE: This assumes an authentication middleware has successfully
     *  retrieved and attached the partner's full data (including address) to req.user.
     */
    const partner = req.user;
    // console.log("logged in partner:", partner);

    if (!partner || !partner.address) {
      return res.status(401).json({
        message:
          "Authentication failed or partner address information is missing.",
      });
    }

    // 2. Extract the required City
    const partnerCity = partner.address.city;

    if (!partnerCity) {
      return res.status(400).json({
        message: "Partner's city is missing in the profile data.",
      });
    }

    // 3. Query the Orders collection
    const orders = await Order.aggregate([
      // 1. FILTER STAGE: Match orders where the customer's city equals the partner's city
      {
        $match: {
          "customerDetails.addressDetails.city": partnerCity,
          "assignmentStatus.assigned": false,
          status: { $in: ["in-progress", "pending"] },
        },
      },

      // 2. PROJECTION STAGE: Reshape and flatten the document fields
      {
        $project: {
          _id: 1,
          orderId: 1,

          // Customer Details
          customerName: "$customerDetails.name",
          customerEmail: "$customerDetails.email",
          customerPhone: "$customerDetails.phone",
          customerAddress: "$customerDetails.addressDetails.address",
          customerCity: "$customerDetails.addressDetails.city",
          customerState: "$customerDetails.addressDetails.state",
          customerPinCode: "$customerDetails.addressDetails.pinCode",

          // Order/Pricing Details
          status: 1,
          offerPrice: 1,

          // Product Details
          productName: "$productDetails.productName",
          productBrand: "$productDetails.productBrand",
          productCategory: "$productDetails.productCategory",
          variantName: "$productDetails.variant.variantName",
          // variantPrice: "$productDetails.variant.price",

          // Scheduling/Status Details
          scheduledDate: "$schedulePickUp.date",
          timeSlot: "$schedulePickUp.timeSlot",

          // Timestamps
          createdAt: 1,
        },
      },

      // Optional: Sorting stage (e.g., sort by newest first)
      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.status(200).json({
      count: orders.length,
      city: partnerCity,
      orders,
      message: `Successfully fetched and formatted ${orders.length} orders from city: ${partnerCity}.`,
    });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

/**
 * Get orders by status with optional date filtering
 * @route GET /api/partners-orders/:id
 * @access Private
 */
export const getPartnerOrderId = async (req, res) => {
  console.log("getPartnerOrderId controller");

  try {
    const orderId = req.params.orderId;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // 1. Filter the order by orderId
    // 2. Project the fields into the desired flat format
    const [order] = await Order.aggregate([
      {
        $match: {
          orderId: orderId, // Filter by the orderId from the request parameters
        },
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field
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
    ]);

    // Check if an order was found
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${orderId} not found`,
      });
    }

    // Return the single, flattened order object
    res.status(200).json({
      success: true,
      order: order, // The single order object
    });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

/**
 * @desc    Assign an order to an partner
 * @route   POST /api/partners-orders/assign-order
 * @access  Private (Partner)
 */
export const assignOrderToPartner = async (req, res) => {
  console.log("assignOrderToPartner controller called..!");

  try {
    // Here orderId is the object ID not the custom created OrderID
    const { orderId } = req.body;
    console.log("req.body", req.body);

    const partnerId = req.user._id;

    const assignmentStatus = {
      assigned: true,
      assignedAt: new Date(),
      assignedTo: {
        name: req.user.name,
        phone: req.user.phone,
        role: req.user.role,
      },
      assignedBy: {
        name: req.user.name,
        role: req.user.role,
      },
    };

    const partner = await Partner.findById(partnerId).select(
      "-password -sessionTokens"
    );

    if (!partner) {
      return res.status(404).json({ message: "Partner not found." });
    }
    console.log("partner found, name:", partner.name);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    console.log("order", order.orderId);

    // Check if the order is already assigned
    const orderAlreadyAssigned = order.assignmentStatus.assigned;
    if (orderAlreadyAssigned) {
      return res.status(400).json({
        success: false,
        message:
          "Order already assigned to another partner. Please refresh you dashboard.",
      });
    }

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
    await Partner.updateMany(
      {
        "assignedOrders.orderObjectId": updateOrder._id,
        _id: { $ne: partnerId },
      },
      {
        $pull: { assignedOrders: { orderObjectId: updateOrder._id } },
      }
    );

    // Add order to partner's assigned orders
    partner.assignedOrders.push({
      orderObjectId: updateOrder._id,
      orderId: updateOrder.orderId,
      assignedAt: new Date(),
    });
    await partner.save();

    res.status(200).json({
      message: `Order ${updateOrder.orderId} assigned to ${partner.name} successfully.`,
      partner,
    });
  } catch (error) {
    console.error("Error assigning order:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Assign an order to an executive
 * @route   GET /api/partners-orders/orders
 * @access  Private (Partner / Partner_Executive)
 */
export const getMyAssignedOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await Partner.findById(userId)
      .populate("assignedOrders.orderObjectId")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "Partner not found." });
    }
    console.log("partner(user) found, name:", user.name);

    const orders = user.assignedOrders
      .map((a) => a.orderObjectId)
      .filter(Boolean);

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
