import express from "express";
import {
  createSlider,
  deleteSlider,
  getActiveSliders,
  getAllSliders,
  updateSlider,
} from "../controllers/sliderController.js";

const router = express.Router();

router.get("/active-sliders", getActiveSliders);
router.get("/all-sliders", getAllSliders);
router.post("/create-slider", createSlider);
router.put("/update-slider/:sliderId", updateSlider);
router.delete("/delete-slider/:sliderId", deleteSlider);

export default router;
