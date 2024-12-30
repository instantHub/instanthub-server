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
} from "../../controllers/services/servicesController.js";

const router = express.Router();

// router.get("/", getServices);
// router.get("/search-services", getAllServices);
// router.post("/add-service", addServices);
// router.put("/update-service/:serviceId", updateService);
// router.delete("/delete-service", deleteService);

// RESTFul Api
router.get("/", getServices); // Get all services
router.get("/search", getCategoryServices); // Search services
router.post("/", addServices); // Add a new service
router.put("/:serviceId", updateService); // Update a service by ID
router.delete("/", deleteService); // Delete a service by ID

// SERVICE ORDERS
// router.get("/get-orders", getServicerOrders);
// router.post("/create-order", createServiceOrder);
// router.put("/completed-service-order", serviceOrderCompleted);
// router.delete("/delete-order/:orderId", deleteServiceOrder);
router.get("/orders", getServicerOrders);
router.post("/orders", createServiceOrder);
router.put("/orders/:serviceOrderId", serviceOrderCompleted);
router.delete("/orders/:serviceOrderId", deleteServiceOrder);

export default router;
