import express from "express";
import {
  createOrder,
  deleteOrder,
  getOrders,
  orderReceived,
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/", getOrders);
router.post("/create-order", createOrder);
router.put("/order-received", orderReceived);
router.delete("/delete-order/:orderId", deleteOrder);

export default router;
