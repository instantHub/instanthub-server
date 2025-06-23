import express from "express";
import {
  getOrders,
  getOneOrders,
  createOrder,
  deleteOrder,
  orderReceived,
  assignAgent,
  orderCancel,
  getOrdersCounts,
  getTodaysOrders,
  getPendingOrders,
  getCompletedOrders,
  getCancelledOrders,
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/count", getOrdersCounts);
router.get("/today", getTodaysOrders);
router.get("/pending", getPendingOrders);
router.get("/completed", getCompletedOrders);
router.get("/cancelled", getCancelledOrders);

router.get("/", getOrders);
router.get("/:orderId", getOneOrders);
router.post("/", createOrder);
router.put("/complete", orderReceived);
router.put("/cancel/:orderId", orderCancel);
router.patch("/assign-agent/:orderId", assignAgent);
router.delete("/delete-order/:orderId", deleteOrder);

// router.put("/order-received", orderReceived);
// router.post("/create-order", createOrder);

export default router;
