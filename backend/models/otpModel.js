import mongoose from "mongoose";

const otpSchema = mongoose.Schema(
  {
    otp: {
      type: Number,
      required: true,
    },
    mobileNumber: {
      type: Number,
      required: true,
    },
    totalOTPsTaken: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // OTP expires after 10 minutes (600 seconds)
    },
  },
  { timestamps: true }
);

// otpSchema.index(
//   { mobileNumber: 1, createdAt: 1 },
//   { expireAfterSeconds: 24 * 60 * 60 }
// ); // TTL index to automatically remove documents after 24 hours

const virtual = otpSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
otpSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
