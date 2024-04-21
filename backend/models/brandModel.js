import mongoose, { mongo } from "mongoose";
// import express from "express";
// import multer from "multer";
// import path from "path";

// const IMAGE_PATH = path.join("/uploads/users/avatars");

const brandSchema = mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

// let storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "..", IMAGE_PATH));
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + "-" + Date.now());
//   },
// });

// // static
// brandSchema.statics.uploadedAvatar = multer({ storage: storage }).single(
//   "avatar"
// );
// brandSchema.statics.imagePath = IMAGE_PATH;

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
