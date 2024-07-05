import express from "express";
import {
  getRecycleOrders,
  createRecycleOrder,
  recycleOrderReceived,
  deleteRecycleOrder,
} from "../controllers/recycleController.js";

const router = express.Router();

router.get("/get-orders", getRecycleOrders);
router.post("/create-order", createRecycleOrder);
router.put("/order-received", recycleOrderReceived);
router.delete("/delete-order/:orderId", deleteRecycleOrder);

export default router;
