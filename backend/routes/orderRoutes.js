import express from "express";
import { createOrder, getOrders } from "../controllers/orderController.js";

const router = express.Router();

router.get("/", getOrders);
router.post("/create-order", createOrder);
router.delete("/delete-order");

export default router;
