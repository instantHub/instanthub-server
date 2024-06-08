import express from "express";
import { getStocks, stockSold } from "../controllers/stockController.js";

const router = express.Router();

// router.get("/:mobileNo", getOTP);
router.get("/", getStocks);
router.put("/stock-sold", stockSold);
// router.post("/generate-otp", generateOTP);
// router.put("/order-received", orderReceived);

export default router;
