import express from "express";
import {
  addBrand,
  getBrands,
  getAllBrands,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllBrands);
router.get("/:catId", getBrands);
router.post("/add-brand", addBrand);
router.put("/update-brand/:brandId", updateBrand);
router.delete("/delete-brand/:brandId", deleteBrand);

export default router;
