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
    categoryType: {
      multiVariants: { type: Boolean, default: false },
      processorBased: { type: Boolean, default: false },
      simple: { type: Boolean, default: false },
    },
    brands: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
      },
    ],

    // Add SEO fields
    metaTitle: {
      type: String,
      // required: true,
      trim: true,
      maxlength: 60,
    },
    metaDescription: {
      type: String,
      // required: true,
      trim: true,
      maxlength: 160,
    },
    metaKeywords: [
      {
        type: String,
        trim: true,
      },
    ],
    canonicalUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// db.categories.createIndex({ uniqueURL: 1 }, { unique: true });

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
