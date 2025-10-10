import express from "express";
import {
  createExecutive,
  getExecutives,
  updateExecutive,
  deleteExecutive,
  assignOrderToExecutive,
  getExecutiveOrders,
  getExecutiveOrdersByStatus,
  getExecutiveOrderCounts,
  getExecutiveScheduledOrders,
} from "../controllers/executiveController.js";
import { auth, authorize } from "../middleware/index.js";
import { ROLES } from "../constants/auth.js";
import { geOrderById } from "../controllers/orderController.js";

const router = express.Router();

// All routes are protected and require admin authentication

router.get(
  "/:orderId/order-details",
  auth,
  authorize(ROLES.executive),
  geOrderById
);

router.put(
  "/:id",
  auth,
  authorize(ROLES.admin, ROLES.executive),
  updateExecutive
);

router.get("/orders", auth, authorize(ROLES.executive), getExecutiveOrders);

router.get(
  "/:id/orders-count",
  auth,
  authorize(ROLES.executive),
  getExecutiveOrderCounts
);

router.get(
  "/:id/:status/orders",
  auth,
  authorize(ROLES.executive),
  getExecutiveOrdersByStatus
);

router.get(
  "/schedule-orders",
  auth,
  authorize(ROLES.executive),
  getExecutiveScheduledOrders
);

router.use(auth, authorize(ROLES.admin));

router.route("/").post(createExecutive).get(getExecutives);

router.post("/assign-order", assignOrderToExecutive);

router.delete("/:id", deleteExecutive);

export default router;
