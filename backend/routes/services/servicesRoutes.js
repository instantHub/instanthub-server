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
  getCategoryServices,
  getServiceOrder,
  cancelServiceOrder,
} from "../../controllers/services/servicesController.js";

const router = express.Router();

// RESTFul Api
router.get("/", getServices); // Get all services
router.get("/search", getCategoryServices); // Search services
router.post("/", addServices); // Add a new service
router.put("/:serviceId", updateService); // Update a service by ID
router.delete("/", deleteService); // Delete a service by ID

// SERVICE ORDERS
router.get("/orders", getServicerOrders);
router.get("/orders/:serviceOrderId", getServiceOrder);
router.post("/orders", createServiceOrder);
router.put("/orders/:serviceOrderId", serviceOrderCompleted);
router.patch("/orders/cancel/:serviceOrderId", cancelServiceOrder);
router.delete("/orders/:serviceOrderId", deleteServiceOrder);

export default router;
