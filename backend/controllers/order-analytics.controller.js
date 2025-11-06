import Order from "../models/orderModel.js";

/**
 * Get monthly order statistics with filters
 * @route GET /api/orders/analytics/monthly-stats
 * @query year - Year to filter (default: current year)
 * @query location - City to filter (optional)
 * @query status - Order status to filter (optional)
 * @access Private (Admin)
 */
export const getMonthlyOrderStats = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), location, status } = req.query;

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    // Build match query
    const matchQuery = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (location && location !== "all") {
      matchQuery["customerDetails.addressDetails.city"] = location;
    }

    if (status && status !== "all") {
      matchQuery.status = status;
    }

    // Aggregate monthly data
    const monthlyData = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          inProgressOrders: {
            $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
          },
          // Revenue ONLY from completed orders with finalPrice
          totalRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "completed"] },
                    { $ne: ["$finalPrice", null] },
                  ],
                },
                "$finalPrice",
                0,
              ],
            },
          },
          // Average ONLY from completed orders with finalPrice
          averageOrderValue: {
            $avg: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "completed"] },
                    { $ne: ["$finalPrice", null] },
                  ],
                },
                "$finalPrice",
                null,
              ],
            },
          },
          // Count of completed orders with finalPrice (for accurate average)
          completedOrdersWithPrice: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "completed"] },
                    { $ne: ["$finalPrice", null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing months with zero data
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const formattedData = months.map((month, index) => {
      const monthData = monthlyData.find((data) => data._id === index + 1);
      return {
        month,
        monthNumber: index + 1,
        totalOrders: monthData?.totalOrders || 0,
        completedOrders: monthData?.completedOrders || 0,
        pendingOrders: monthData?.pendingOrders || 0,
        cancelledOrders: monthData?.cancelledOrders || 0,
        inProgressOrders: monthData?.inProgressOrders || 0,
        totalRevenue: monthData?.totalRevenue || 0,
        averageOrderValue: monthData?.averageOrderValue || 0,
        completedOrdersWithPrice: monthData?.completedOrdersWithPrice || 0,
      };
    });

    // Calculate totals (ONLY completed orders with finalPrice)
    const totals = {
      totalOrders: formattedData.reduce((sum, m) => sum + m.totalOrders, 0),
      completedOrders: formattedData.reduce(
        (sum, m) => sum + m.completedOrders,
        0
      ),
      pendingOrders: formattedData.reduce((sum, m) => sum + m.pendingOrders, 0),
      cancelledOrders: formattedData.reduce(
        (sum, m) => sum + m.cancelledOrders,
        0
      ),
      inProgressOrders: formattedData.reduce(
        (sum, m) => sum + m.inProgressOrders,
        0
      ),
      totalRevenue: formattedData.reduce((sum, m) => sum + m.totalRevenue, 0),
      completedOrdersWithPrice: formattedData.reduce(
        (sum, m) => sum + m.completedOrdersWithPrice,
        0
      ),
      averageOrderValue: 0,
    };

    // Calculate overall average from total revenue and completed orders with price
    if (totals.completedOrdersWithPrice > 0) {
      totals.averageOrderValue =
        totals.totalRevenue / totals.completedOrdersWithPrice;
    }

    res.status(200).json({
      success: true,
      data: {
        year: parseInt(year),
        location: location || "all",
        status: status || "all",
        monthlyData: formattedData,
        totals,
      },
    });
  } catch (error) {
    console.error("Error fetching monthly order stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch monthly statistics",
      error: error.message,
    });
  }
};

/**
 * Get location-wise order statistics
 * @route GET /api/orders/analytics/location-stats
 * @query year - Year to filter (default: current year)
 * @query month - Month to filter (optional, 1-12)
 * @query status - Order status to filter (optional)
 * @access Private (Admin)
 */
export const getLocationWiseStats = async (req, res) => {
  try {
    const {
      year = new Date().getFullYear(),
      month,
      status,
      limit = 10,
    } = req.query;

    // Build date range
    let matchQuery = {};

    if (month) {
      const startDate = new Date(
        `${year}-${String(month).padStart(2, "0")}-01`
      );
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);

      matchQuery.createdAt = { $gte: startDate, $lte: endDate };
    } else {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
      matchQuery.createdAt = { $gte: startDate, $lte: endDate };
    }

    if (status && status !== "all") {
      matchQuery.status = status;
    }

    const locationData = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$customerDetails.addressDetails.city",
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          // Revenue ONLY from completed orders with finalPrice
          totalRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "completed"] },
                    { $ne: ["$finalPrice", null] },
                  ],
                },
                "$finalPrice",
                0,
              ],
            },
          },
          // Average revenue per completed order
          averageOrderValue: {
            $avg: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "completed"] },
                    { $ne: ["$finalPrice", null] },
                  ],
                },
                "$finalPrice",
                null,
              ],
            },
          },
        },
      },
      { $sort: { totalOrders: -1 } },
      { $limit: parseInt(limit) },
    ]);

    const formattedData = locationData.map((location) => ({
      city: location._id || "Unknown",
      totalOrders: location.totalOrders,
      completedOrders: location.completedOrders,
      pendingOrders: location.pendingOrders,
      cancelledOrders: location.cancelledOrders,
      totalRevenue: location.totalRevenue,
      averageOrderValue: location.averageOrderValue || 0,
      completionRate:
        location.totalOrders > 0
          ? ((location.completedOrders / location.totalOrders) * 100).toFixed(1)
          : "0",
    }));

    res.status(200).json({
      success: true,
      data: {
        year: parseInt(year),
        month: month ? parseInt(month) : null,
        status: status || "all",
        locations: formattedData,
        totalLocations: formattedData.length,
      },
    });
  } catch (error) {
    console.error("Error fetching location-wise stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch location statistics",
      error: error.message,
    });
  }
};

/**
 * Get yearly comparison data
 * @route GET /api/orders/analytics/yearly-comparison
 * @query years - Comma-separated years (e.g., "2024,2025,2026")
 * @access Private (Admin)
 */
export const getYearlyComparison = async (req, res) => {
  try {
    const { years = "2024,2025,2026" } = req.query;
    const yearList = years.split(",").map((y) => parseInt(y.trim()));

    const yearlyData = await Promise.all(
      yearList.map(async (year) => {
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

        const stats = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              completedOrders: {
                $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
              },
              pendingOrders: {
                $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
              },
              cancelledOrders: {
                $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
              },
              inProgressOrders: {
                $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
              },
              // Revenue ONLY from completed orders with finalPrice
              totalRevenue: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$status", "completed"] },
                        { $ne: ["$finalPrice", null] },
                      ],
                    },
                    "$finalPrice",
                    0,
                  ],
                },
              },
              // Average ONLY from completed orders with finalPrice
              averageOrderValue: {
                $avg: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$status", "completed"] },
                        { $ne: ["$finalPrice", null] },
                      ],
                    },
                    "$finalPrice",
                    null,
                  ],
                },
              },
              // Count of completed orders with price
              completedOrdersWithPrice: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$status", "completed"] },
                        { $ne: ["$finalPrice", null] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ]);

        return {
          year,
          totalOrders: stats[0]?.totalOrders || 0,
          completedOrders: stats[0]?.completedOrders || 0,
          pendingOrders: stats[0]?.pendingOrders || 0,
          cancelledOrders: stats[0]?.cancelledOrders || 0,
          inProgressOrders: stats[0]?.inProgressOrders || 0,
          totalRevenue: stats[0]?.totalRevenue || 0,
          averageOrderValue: stats[0]?.averageOrderValue || 0,
          completedOrdersWithPrice: stats[0]?.completedOrdersWithPrice || 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        years: yearList,
        yearlyData,
      },
    });
  } catch (error) {
    console.error("Error fetching yearly comparison:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch yearly comparison",
      error: error.message,
    });
  }
};

/**
 * Get available cities for filter
 * @route GET /api/orders/analytics/cities
 * @access Private (Admin)
 */
export const getAvailableCities = async (req, res) => {
  try {
    const cities = await Order.distinct("customerDetails.addressDetails.city");

    const sortedCities = cities
      .filter((city) => city && city.trim() !== "")
      .sort();

    res.status(200).json({
      success: true,
      data: {
        cities: sortedCities,
        totalCities: sortedCities.length,
      },
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cities",
      error: error.message,
    });
  }
};

/**
 * Get detailed revenue breakdown
 * @route GET /api/orders/analytics/revenue-details
 * @query year - Year to filter
 * @query month - Month to filter (optional)
 * @access Private (Admin)
 */
export const getRevenueDetails = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month } = req.query;

    let matchQuery = { status: "completed", finalPrice: { $ne: null } };

    if (month) {
      const startDate = new Date(
        `${year}-${String(month).padStart(2, "0")}-01`
      );
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);

      matchQuery.completedAt = { $gte: startDate, $lte: endDate };
    } else {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
      matchQuery.completedAt = { $gte: startDate, $lte: endDate };
    }

    const revenueStats = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$finalPrice" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$finalPrice" },
          minOrderValue: { $min: "$finalPrice" },
          maxOrderValue: { $max: "$finalPrice" },
          totalOfferPrice: { $sum: "$offerPrice" },
        },
      },
    ]);

    const stats = revenueStats[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      minOrderValue: 0,
      maxOrderValue: 0,
      totalOfferPrice: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        year: parseInt(year),
        month: month ? parseInt(month) : null,
        revenue: {
          total: stats.totalRevenue,
          average: stats.averageOrderValue,
          min: stats.minOrderValue,
          max: stats.maxOrderValue,
        },
        orders: {
          total: stats.totalOrders,
          totalOfferPrice: stats.totalOfferPrice,
          averageDiscount: stats.totalOfferPrice - stats.totalRevenue,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching revenue details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch revenue details",
      error: error.message,
    });
  }
};
