import mongoose, { mongo } from "mongoose";
import Category from "./categoryModel.js";
// import ConditionLabel from "./conditionLabelModel.js";

const orderSchema = mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    category: {
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "Category",
      type: String,
      required: true,
    },
    variant: {
      variantName: { type: String },
      price: { type: Number },
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
    pinCode: {
      type: Number,
    },
    accessoriesNotAvailable: {
      type: Array,
    },
    deductions: [
      {
        conditionLabel: {
          type: String,
        },
        priceDrop: {
          type: Number,
        },
        operation: {
          type: String,
        },
      },
    ],
    offerPrice: {
      type: Number,
    },
    schedulePickUp: {
      type: String,
    },
    pickedUpOn: {
      type: String,
    },
    status: {
      type: String,
    },
    customerProofFront: {
      type: String,
    },
    customerProofBack: {
      type: String,
    },
    customerOptional1: {
      type: String,
    },
    customerOptional2: {
      type: String,
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
