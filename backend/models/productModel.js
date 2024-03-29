import mongoose from "mongoose";

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  uniqueURL: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ], // Reference to the Categories collection
  brand: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
  ], // Reference to the Brands collection
  variants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
    },
  ],
  series: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Series",
    },
  ],
});

const virtual = productSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
productSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Product = mongoose.model("Product", productSchema);
export default Product;
