import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductDetails,
  getProducts,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:brandId", getProducts);
router.get("/product-details/:prodId", getProductDetails);
router.post("/add-product", createProduct);

export default router;
