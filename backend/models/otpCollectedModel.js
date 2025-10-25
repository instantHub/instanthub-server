import mongoose from "mongoose";

const otpCollectedSchema = mongoose.Schema(
  {
    mobileNumber: {
      type: Number,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    selectedDeductionSet: { type: Array },
    totalOTPsTaken: {
      type: Number,
    },
  },
  { timestamps: true }
);

const virtual = otpCollectedSchema.virtual("id");
virtual.get(function () {
  return this._id;
});

otpCollectedSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const OTPCollected = mongoose.model("OTPCollected", otpCollectedSchema);
export default OTPCollected;
