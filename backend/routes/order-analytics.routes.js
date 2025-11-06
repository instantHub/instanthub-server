import express from "express";
import { auth, authorize } from "../middleware/index.js";
import { ROLES } from "../constants/auth.js";
import {
  getAvailableCities,
  getLocationWiseStats,
  getMonthlyOrderStats,
  getYearlyComparison,
} from "../controllers/order-analytics.controller.js";

const router = express.Router();

// All routes require admin authentication
router.use(auth);
router.use(authorize(ROLES.admin));

// @route   GET /api/orders/analytics/monthly-stats
router.get("/monthly-stats", getMonthlyOrderStats);

// @route   GET /api/orders/analytics/location-stats
router.get("/location-stats", getLocationWiseStats);

// @route   GET /api/orders/analytics/yearly-comparison
router.get("/yearly-comparison", getYearlyComparison);

// @route   GET /api/orders/analytics/cities
router.get("/cities", getAvailableCities);

export default router;
