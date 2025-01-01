import mongoose from "mongoose";

const recycleOrderSchema = mongoose.Schema(
  {
    recycleOrderId: {
      type: String,
      required: true,
    },
    productDetails: {
      productName: {
        type: String,
      },
      productBrand: {
        type: String,
      },
      productCategory: {
        type: String,
      },
      productVariant: {
        type: String,
      },
      productAge: {
        type: String,
      },
      productStatus: {
        type: String,
      },
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
    deviceInfo: {
      serialNumber: { type: String },
      imeiNumber: { type: String },
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

    paymentMode: {
      type: String,
    },
    recyclePrice: {
      type: Number,
    },
    finalPrice: {
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
  },
  { timestamps: true }
);

// orderSchema.index({ name: 1, category: 1 }, { unique: true });

const virtual = recycleOrderSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
recycleOrderSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const RecycleOrder = mongoose.model("RecycleOrder", recycleOrderSchema);
export default RecycleOrder;
