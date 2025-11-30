import Order from "../../models/orderModel";

/**
 * Get orders by status with optional date filtering
 * @route GET /api/partners/orders/:id
 * @access Private
 */
export const getOrdersId = async (req, res) => {
  console.log("getOrdersId controller");

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
