import express from "express";
import {
  createSlider,
  deleteSlider,
  getActiveSliders,
  getAllSliders,
  updateSlider,
  getSliderById,
} from "../controllers/sliderController.js";
import { createUploadMiddleware } from "../middleware/uploadMiddleware.js";

const router = express.Router();

const sliderUpload = createUploadMiddleware("sliders");

router.get("/active-sliders", getActiveSliders);
router.get("/all-sliders", getAllSliders);

router.get("/:sliderId", getSliderById);

router.post(
  "/create-slider",
  sliderUpload.fields([{ name: "slider", maxCount: 1 }]),
  createSlider
);

router.put(
  "/update-slider/:sliderId",
  sliderUpload.single("slider"),
  updateSlider
);
// router.put("/update-slider/:sliderId", updateSlider);
router.delete("/delete-slider/:sliderId", deleteSlider);

export default router;
