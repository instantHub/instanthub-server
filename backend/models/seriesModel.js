import mongoose from "mongoose";

const seriesSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    product: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

const virtual = seriesSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
seriesSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Series = mongoose.model("Series", seriesSchema);
export default Series;
