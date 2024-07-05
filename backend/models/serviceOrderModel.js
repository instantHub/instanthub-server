import mongoose, { mongo } from "mongoose";
import Category from "./categoryModel.js";
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
    status: {
      type: String,
    },
    inspectionCharges: {
      type: Number,
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
