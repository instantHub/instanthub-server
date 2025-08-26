import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductDetails,
  getProductsByBrand,
  updatePriceDrop,
  updateProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getAllProducts);

// router.get("/:brandId", getProductsByBrand);
router.get("/:brandUniqueURL", getProductsByBrand);

router.get("/product-details/:productUniqueURL", getProductDetails);

router.post("/add-product", createProduct);

// router.put("/update-product/:productId", updateProduct);
router.put("/update-product/:productSlug", updateProduct);

router.delete("/delete-product/:productId", deleteProduct);

// route for updating Product's Deductions PRICEDROP value for a single Product
router.put("/update-pricedrop/:productId", updatePriceDrop);

export default router;
