import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProcessorDeductions,
  getProductDetails,
  getProductsByBrand,
  updateLaptopConfigurationsPriceDrop,
  updatePriceDrop,
  updateProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:brandId", getProductsByBrand);
router.get("/product-details/:prodId", getProductDetails);
router.post("/add-product", createProduct);
router.put("/update-product/:productId", updateProduct);
router.delete("/delete-product/:productId", deleteProduct);

// route for updating Product's Deductions PRICEDROP value for a single Product
router.put("/update-pricedrop/:productId", updatePriceDrop);

// route for updating Product's Deductions PRICEDROP value for all Laptops products at once
router.put(
  "/updateLaptopConfigurationsPriceDrop/:productId",
  updateLaptopConfigurationsPriceDrop
);

// Processor route
router.get("/processor-deductions/:processorId", getProcessorDeductions);

export default router;
