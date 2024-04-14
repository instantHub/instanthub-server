import mongoose, { mongo } from "mongoose";
import ConditionLabel from "./conditionLabelModel";

const orderSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    orderId: "string",
    customer: {
      name: "string",
      email: "string",
      phone: "string",
      address: "string",
    },
    device: {
      type: "string",
      brand: "string",
      model: "string",
      condition: "string",
      IMEI: "string",
      storage: "string",
      accessories: ["string"],
      images: ["string"],
    },
    condition: [
      {
        ConditionLabel: {
          type: String,
        },
        priceDrop: {
          type: Number,
        },
      },
    ],
    offerPrice: {
      type: Number,
    },
    status: {
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
