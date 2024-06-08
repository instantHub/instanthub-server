import express from "express";
import { deleteCLImage } from "../controllers/deleteImageController.js";

const router = express.Router();

router.delete("/delete-cl-image", deleteCLImage);

export default router;
