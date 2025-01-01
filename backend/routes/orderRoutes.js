import express from "express";
import {
  getOrders,
  getOneOrders,
  createOrder,
  deleteOrder,
  orderReceived,
  orderCancel,
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/", getOrders);
router.get("/:orderId", getOneOrders);
router.post("/", createOrder);
router.put("/complete", orderReceived);
router.put("/cancel/:orderId", orderCancel);
router.delete("/delete-order/:orderId", deleteOrder);

// router.put("/order-received", orderReceived);
// router.post("/create-order", createOrder);

export default router;
