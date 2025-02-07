import express from "express";
import {
  getAllProcessorDeductions,
  getProcessorDeductions,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getAllProcessorDeductions);
router.get("/deductions/:processorId", getProcessorDeductions);

export default router;
