import Coupon from "../models/couponModel.js";

export const getCoupon = async (req, res) => {
  console.log("getCoupon Controller");

  try {
    const coupons = await Coupon.find();
    // console.log(coupons);
    res.status(200).json(coupons);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createCoupon = async (req, res) => {
  console.log("createCoupon Controller");
  console.log(req.body);

  try {
    const coupon = await Coupon.create(req.body);
    console.log(coupon);
    res.status(200).json(coupon);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// DELETE Coupon
export const deleteCoupon = async (req, res) => {
  console.log("deleteCoupon controller");
  const couponId = req.params.couponId;
  console.log(couponId);

  try {
    // 1. Delete brand
    const deletedCoupon = await Coupon.findByIdAndDelete(couponId);
    console.log("deletedCoupon", deletedCoupon);

    return res
      .status(201)
      .json({ data: deletedCoupon, message: "Coupon deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error while deleting Order.", error });
  }
};
