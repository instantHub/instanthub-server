import mongoose from "mongoose";

const couponSchema = mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: true,
    },
    couponValue: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const virtual = couponSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
couponSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
