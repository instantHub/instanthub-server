import express from "express";
import { getOTP, generateOTP } from "../controllers/otpController.js";

const router = express.Router();

router.get("/:mobileNo", getOTP);
router.post("/generate-otp", generateOTP);
// router.put("/order-received", orderReceived);

export default router;
