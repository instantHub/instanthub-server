import mongoose from "mongoose";

const PartnerRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    businessName: {
      type: String,
      required: false,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      required: function () {
        return this.status === "rejected";
      }, // Only required if status is rejected
    },
  },
  { timestamps: true }
);

const PartnerRequest = mongoose.model("PartnerRequest", PartnerRequestSchema);

export default PartnerRequest;
