import express from "express";
import {
  getRecycleOrders,
  createRecycleOrder,
  recycleOrderReceived,
  deleteRecycleOrder,
} from "../controllers/recycleController.js";

const router = express.Router();

router.get("/orders", getRecycleOrders);
router.post("/orders", createRecycleOrder);
router.put("/orders/:recycleOrderId", recycleOrderReceived);
router.delete("/orders/:recycleOrderId", deleteRecycleOrder);

export default router;
