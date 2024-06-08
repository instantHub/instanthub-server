import express from "express";
import {
  getCoupon,
  createCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";

const router = express.Router();

router.get("/", getCoupon);
router.post("/add-coupon", createCoupon);
router.delete("/delete-coupon/:couponId", deleteCoupon);

export default router;
