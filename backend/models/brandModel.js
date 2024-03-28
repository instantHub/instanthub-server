import mongoose, { mongo } from "mongoose";

const brandSchema = mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
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
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

// brandSchema.index({ name: 1, category: 1 }, { unique: true });

// Remove unique constraint on name field
brandSchema.index({ name: 1 });

const virtual = brandSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
brandSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Brand = mongoose.model("Brand", brandSchema);
export default Brand;
