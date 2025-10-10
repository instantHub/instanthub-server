import express from "express";
import {
  getOTP,
  generateOTP,
  getPhoneNumbers,
  deleteNumber,
} from "../controllers/otpController.js";

const router = express.Router();

router.get("/:mobileNo", getOTP);
router.get("/", getPhoneNumbers);
router.delete("/number/:numberId", deleteNumber);
router.post("/generate-otp", generateOTP);
// router.put("/order-received", orderComplete);

export default router;
