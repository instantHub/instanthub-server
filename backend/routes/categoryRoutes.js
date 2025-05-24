import express from "express";
import {
  addCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/:categoryId", getCategory);
router.post("/add-category", addCategory);
router.put("/update-category/:categoryId", updateCategory);
router.delete("/delete-category/:catId", deleteCategory);

export default router;
