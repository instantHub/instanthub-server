import express from "express";
import {
  createSlider,
  deleteSlider,
  getSliders,
  updateSlider,
} from "../controllers/sliderController.js";

const router = express.Router();

router.get("/", getSliders);
router.post("/create-slider", createSlider);
router.put("/update-slider/:sliderId", updateSlider);
router.delete("/delete-slider/:sliderId", deleteSlider);

export default router;
