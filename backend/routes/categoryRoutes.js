import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  topSellingProducts,
  updateCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/:categoryUniqueURL", getCategory);
router.post("/", createCategory);
router.put("/:categoryId", updateCategory);
router.delete("/:catId", deleteCategory);

router.get("/top-products/:categoryName", topSellingProducts);

// router.put("/update-category/:categoryId", updateCategory);
// router.delete("/delete-category/:catId", deleteCategory);

export default router;
