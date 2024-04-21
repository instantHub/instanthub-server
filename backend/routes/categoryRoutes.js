import express from "express";
import {
  addCategory,
  deleteCategory,
  getCategory,
  updateCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategory);
router.post("/add-category", addCategory);
router.put("/update-category/:catId", updateCategory);
router.delete("/delete-category/:catId", deleteCategory);

export default router;
