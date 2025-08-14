import express from "express";

import {
  cancelServiceOrder,
  createServiceOrder,
  deleteServiceOrder,
  getServiceOrder,
  getServicerOrders,
  serviceOrderCompleted,
} from "../../controllers/services/serviceOrderController.js";

import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  createBrand,
  getBrandById,
  updateBrand,
  deleteBrand,
  createProblem,
  getProblemById,
  updateProblem,
  deleteProblem,
  getBrandByCategory,
  getProblemsByCategory,
} from "../../controllers/services/servicesController.js";

const router = express.Router();

// Category Routes
router.post("/categories", createCategory);
router.get("/categories", getAllCategories);
router.get("/categories/:id", getCategoryById);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// Brand Routes
router.post("/brands", createBrand);
router.get("/brands/category/:categoryId", getBrandByCategory);
router.get("/brands/:id", getBrandById);
router.put("/brands/:id", updateBrand);
router.delete("/brands/:id", deleteBrand);

// Problem Routes
router.post("/problems", createProblem);
router.get("/problems/category/:categoryId", getProblemsByCategory);
router.get("/problems/:id", getProblemById);
router.put("/problems/:id", updateProblem);
router.delete("/problems/:id", deleteProblem);

// // SERVICE ORDERS
router.get("/orders", getServicerOrders);
router.get("/orders/:serviceOrderId", getServiceOrder);
router.post("/orders", createServiceOrder);
router.put("/orders/:serviceOrderId", serviceOrderCompleted);
router.patch("/orders/cancel/:serviceOrderId", cancelServiceOrder);
router.delete("/orders/:serviceOrderId", deleteServiceOrder);

export default router;
