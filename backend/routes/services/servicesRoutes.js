import express from "express";

import {
  cancelServiceOrder,
  createServiceOrder,
  deleteServiceOrder,
  getServiceOrder,
  getServicerOrders,
  serviceOrderCompleted,
} from "../../controllers/services/serviceOrderController.js";

const router = express.Router();

// SERVICE ORDERS
router.get("/orders", getServicerOrders);
router.get("/orders/:serviceOrderId", getServiceOrder);
router.post("/orders", createServiceOrder);
router.put("/orders/:serviceOrderId", serviceOrderCompleted);
router.patch("/orders/cancel/:serviceOrderId", cancelServiceOrder);
router.delete("/orders/:serviceOrderId", deleteServiceOrder);

export default router;
