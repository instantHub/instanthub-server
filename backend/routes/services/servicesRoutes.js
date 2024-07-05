import express from "express";
import {
  getServices,
  addServices,
  updateService,
  deleteService,
  getServicerOrders,
  createServiceOrder,
  deleteServiceOrder,
  serviceOrderCompleted,
} from "../../controllers/services/servicesController.js";

const router = express.Router();

router.get("/", getServices);
router.post("/add-service", addServices);
router.put("/update-service/:serviceId", updateService);
router.delete("/delete-service", deleteService);

// SERVICE ORDERS
router.get("/get-orders", getServicerOrders);
router.post("/create-order", createServiceOrder);
router.put("/completed-service-order", serviceOrderCompleted);
router.delete("/delete-order/:orderId", deleteServiceOrder);

export default router;
