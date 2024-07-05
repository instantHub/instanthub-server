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
    productName: { type: String },
    productBrand: { type: String },
    productCategory: {
      type: String,
      required: true,
    },
    variant: {
      variantName: { type: String },
      price: { type: Number },
    },
    deviceInfo: {
      serialNumber: { type: String },
      imeiNumber: { type: String },
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
    addressDetails: {
      address: {
        type: String,
      },
      state: {
        type: String,
      },
      city: {
        type: String,
      },
      pinCode: {
        type: Number,
      },
    },
    accessoriesAvailable: {
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

    schedulePickUp: {
      type: String,
    },
    pickedUpDetails: {
      agentName: {
        type: String,
      },
      pickedUpDate: {
        type: String,
      },
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
    offerPrice: {
      type: Number,
    },
    finalPrice: {
      type: Number,
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
