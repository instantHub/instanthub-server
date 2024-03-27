import express from "express";
import { addCategory, getCategory } from "../controllers/categoryController.js";

const router = express.Router();

router.get("/category", getCategory);
router.post("/category/add-category", addCategory);

export default router;
