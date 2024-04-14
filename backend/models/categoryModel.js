import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
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
    brands: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
      },
    ],
    // questions: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Question",
    // },
  },
  { timestamps: true }
);

const virtual = categorySchema.virtual("id");
virtual.get(function () {
  return this._id;
});
categorySchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
