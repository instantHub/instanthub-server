import express from "express";
import {
  updateAllLaptopConfigurations,
  updateSingleLaptopConfiguration,
  updateSingleLaptopProcessorProblems,
  updateAllLaptopProcessorProblems,
} from "../../controllers/questions/prices.controller.js";

const router = express.Router();

// Laptop configurations
router.put("/configurations/all", updateAllLaptopConfigurations);
router.put(
  "/configurations/single/:productId",
  updateSingleLaptopConfiguration
);

// Laptop processor problems
router.put("/problems/all", updateAllLaptopProcessorProblems);
router.put("/problems/single", updateSingleLaptopProcessorProblems);

export default router;
