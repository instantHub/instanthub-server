import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productDetails: {
      productName: { type: String },
      productBrand: { type: String },
      productCategory: { type: String, required: true },
      variant: { variantName: { type: String }, price: { type: Number } },
    },

    deviceInfo: {
      serialNumber: { type: String },
      imeiNumber: { type: String },
    },

    customerDetails: {
      name: { type: String },
      email: { type: String },
      phone: { type: Number },
      addressDetails: {
        address: { type: String },
        state: { type: String },
        city: { type: String },
        pinCode: { type: Number },
      },
    },

    // TODO: check and remove if not needed
    deductions: [
      {
        conditionLabel: { type: String },
        priceDrop: { type: Number },
        operation: { type: String },
      },
    ],

    customerIDProof: {
      front: { type: String },
      back: { type: String },
      optional1: { type: String },
      optional2: { type: String },
    },

    finalDeductionSet: { type: Array },

    // schedulePickUp: { type: String },
    // completedAt: { type: String },
    schedulePickUp: {
      date: { type: Date },
      timeSlot: { type: String },
    },
    schedulePickUpRaw: { type: String },

    completedAt: { type: Date },

    status: {
      type: String,
      enum: ["in-progress", "pending", "completed", "cancelled"],
      default: "pending",
    },

    paymentMode: { type: String },
    offerPrice: { type: Number },
    finalPrice: { type: Number },

    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      default: null,
    },

    assignmentStatus: {
      assigned: { type: Boolean, default: false },
      assignedAt: { type: String },

      assignedTo: {
        name: { type: String },
        phone: { type: mongoose.Schema.Types.Mixed },
        role: {
          type: String,
          enum: ["partner", "executive"],
        },
      },
      assignedBy: {
        name: { type: String },
        role: {
          type: String,
          enum: ["admin", "partner"],
        },
      },
    },

    rescheduleStatus: {
      rescheduled: { type: Boolean, default: false },
      rescheduledBy: { type: String, default: null },
      rescheduleReason: { type: String, default: null },
      rescheduleCount: { type: Number, default: 0 },
      lastRescheduledDate: { type: String, default: null },
      previousScheduledDates: { type: Array, default: [] },
    },

    cancellationDetails: {
      cancelledBy: { type: String, default: null },
      cancelReason: { type: String, default: null },
      cancelledAt: { type: String, default: null },
    },
  },
  { timestamps: true }
);

// orderSchema.index({ name: 1, category: 1 }, { unique: true });

const virtual = orderSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
orderSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
