import express from "express";
import {
  getOTP,
  generateOTP,
  getPhoneNumbers,
} from "../controllers/otpController.js";

const router = express.Router();

router.get("/:mobileNo", getOTP);
router.get("/", getPhoneNumbers);
router.post("/generate-otp", generateOTP);
// router.put("/order-received", orderReceived);

export default router;
