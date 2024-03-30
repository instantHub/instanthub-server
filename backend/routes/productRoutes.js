import express from "express";
import {
  createProduct,
  getProducts,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/:brandId", getProducts);
router.post("/add-product", createProduct);

export default router;
