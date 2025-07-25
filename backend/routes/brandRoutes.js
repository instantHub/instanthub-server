import express from "express";
import {
  addBrand,
  getBrands,
  getAllBrands,
  updateBrand,
  deleteBrand,
  getBrand,
} from "../controllers/brandController.js";

const router = express.Router();

router.get("/", getAllBrands);

router.get("/:categoryUniqueURL", getBrands);
// router.get("/:slug", getBrands);

router.get("/single/:brandId", getBrand);

router.post("/add-brand", addBrand);
router.put("/update-brand/:brandId", updateBrand);
router.delete("/delete-brand/:brandId", deleteBrand);

export default router;
