import mongoose from "mongoose";
// import ConditionLabel from "./conditionLabelModel.js";

const serviceOrderSchema = mongoose.Schema(
  {
    serviceOrderId: {
      type: String,
      required: true,
    },
    selectedService: {
      type: Object,
      required: true,
    },
    serviceType: {
      type: String,
      required: true,
    },
    additionalServices: [{ name: { type: String }, price: { type: Number } }],
    deviceInfo: {
      deviceNameModel: { type: String },
      deviceAdditionalInfo: { type: String },
    },
    serviceAgent: {
      type: String,
    },
    customerName: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: Number,
    },
    address: {
      type: String,
    },
    pincode: {
      type: String,
    },
    problems: [
      {
        serviceProblem: {
          type: String,
        },
      },
    ],
    scheduleDate: {
      type: String,
    },
    serviceCompletedOn: {
      type: String,
    },
    inspectionCharges: {
      type: Number,
    },
    // status: {
    //   type: String,
    // },
    status: {
      pending: { type: Boolean },
      completed: { type: Boolean },
      cancelled: { type: Boolean },
    },

    cancelReason: {
      type: String,
      required: function () {
        return this.status.cancelled; // Only required if the order is cancelled
      },
      default: null, // Default to null if not cancelled
    },

    price: {
      type: Number,
    },
    serviceFinalPrice: {
      type: Number,
    },
  },
  { timestamps: true }
);

// orderSchema.index({ name: 1, category: 1 }, { unique: true });

const virtual = serviceOrderSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
serviceOrderSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const ServiceOrder = mongoose.model("ServiceOrder", serviceOrderSchema);
export default ServiceOrder;
