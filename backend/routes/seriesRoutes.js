import express from "express";
import {
  createSeries,
  deleteSeries,
  getSeries,
  getSeriesByBrand,
  updateSeries,
} from "../controllers/seriesController.js";

const router = express.Router();

router.get("/", getSeries);
// router.get("/:brandId", getSeriesByBrand);
router.get("/:brandUniqueURL", getSeriesByBrand);
router.post("/create-series", createSeries);
router.put("/update-series/:seriesId", updateSeries);
router.delete("/delete-series/:seriesId", deleteSeries);

export default router;
