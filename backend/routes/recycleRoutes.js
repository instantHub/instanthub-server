import express from "express";
import {
  getRecycleOrder,
  getRecycleOrders,
  createRecycleOrder,
  recycleOrderReceived,
  recycleOrderCancel,
  deleteRecycleOrder,
} from "../controllers/recycleController.js";

const router = express.Router();

router.get("/orders", getRecycleOrders);
router.get("/orders/:recycleOrderId", getRecycleOrder);
router.post("/orders", createRecycleOrder);
router.put("/orders/:recycleOrderId", recycleOrderReceived);
router.put("/orders/cancel/:recycleOrderId", recycleOrderCancel);
router.delete("/orders/:recycleOrderId", deleteRecycleOrder);

export default router;
