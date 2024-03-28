import express from "express";
import { addBrand, getBrands } from "../controllers/brandController.js";

const router = express.Router();

router.get("/:catId", getBrands);
router.post("/add-brand", addBrand);

export default router;
