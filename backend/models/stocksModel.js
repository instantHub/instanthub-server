import mongoose, { mongo } from "mongoose";

const stocksSchema = mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    productDetails: {
      productName: { type: String },
      productVariant: { type: String },
      productCategory: { type: String },
      serialNumber: { type: String },
      imeiNumber: { type: String },
    },
    customerDetails: {
      customerName: { type: String },
      email: { type: String },
      phone: { type: Number },
    },
    accessoriesAvailable: {
      type: Array,
    },
    pickedUpDetails: {
      agentName: {
        type: String,
      },
      pickedUpDate: {
        type: String,
      },
    },
    soldByDetails: {
      agentName: {
        type: String,
      },
      soldDate: {
        type: String,
      },
    },
    // stockStatus: {
    //   type: String,
    // },
    status: {
      in: { type: Boolean },
      out: { type: Boolean },
      lost: { type: Boolean },
    },
    purchasePrice: {
      type: Number,
    },
    soldPrice: {
      type: Number,
    },
  },
  { timestamps: true }
);

// stocksSchema.index({ name: 1, category: 1 }, { unique: true });

const virtual = stocksSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
stocksSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Stocks = mongoose.model("Stocks", stocksSchema);
export default Stocks;
