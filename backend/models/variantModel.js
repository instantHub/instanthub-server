import mongoose from "mongoose";

const variantSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  product: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

const virtual = variantSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
variantSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Variant = mongoose.model("Variant", variantSchema);
export default Variant;
