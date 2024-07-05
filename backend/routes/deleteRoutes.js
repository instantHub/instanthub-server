import express from "express";
import {
  deleteCLImage,
  deleteImage,
} from "../controllers/deleteImageController.js";

const router = express.Router();

router.delete("/delete-cl-image", deleteCLImage);
router.delete("/delete-image", deleteImage);

export default router;
