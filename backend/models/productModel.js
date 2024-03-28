import mongoose from "mongoose";
import Brand from "./brandModel.js";
import Category from "./categoryModel.js";

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  brand: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Brand,
    },
  ], // Reference to the Brands collection
  category: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Category,
    },
  ], // Reference to the Categories collection
  variants: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      stock: {
        type: Number,
        required: true,
      },
    },
  ],
  series: [
    {
      name: {
        type: String,
      },
    },
  ],
});

const Product = mongoose.model("Product", productSchema);
export default Product;
