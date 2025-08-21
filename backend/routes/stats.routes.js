import express from "express";
import { getMostSoldProductsAndBrands } from "../controllers/stats.controller.js";

const router = express.Router();

router.get("/most-sold", getMostSoldProductsAndBrands);

export default router;
