import express from "express";
import { checkEmptyPricing } from "../controllers/productController.js";

const router = express.Router();

router.get("/empty-pricing", checkEmptyPricing);

export default router;
