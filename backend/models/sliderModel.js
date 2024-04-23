import mongoose from "mongoose";

const sliderSchema = mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const virtual = sliderSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
sliderSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Slider = mongoose.model("Slider", sliderSchema);
export default Slider;
