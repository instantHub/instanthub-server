import express from "express";
import { addCategory, getCategory } from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategory);
router.post("/add-category", addCategory);

export default router;
