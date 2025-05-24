import mongoose from "mongoose";

const ServiceCategorySchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  image: String,
  inspectionCharges: { type: Number, required: true },
  status: { type: String, required: true },
  uniqueURL: { type: String, required: true },
  type: { type: String, required: true },
});

const BrandSchema = new mongoose.Schema({
  serviceCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceCategory",
    required: true,
  },
  name: { type: String, required: true },
  uniqueURL: { type: String, required: true },
  image: String,
});

const ProblemSchema = new mongoose.Schema({
  serviceCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceCategory",
    required: true,
  },
  // serviceBrandId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "ServiceBrand",
  //   required: true,
  // },
  name: { type: String, unique: true, required: true },
  uniqueURL: { type: String, required: true },
  description: String,
  image: String,
  price: Number,
});

const SubCategorySchema = new mongoose.Schema({
  serviceCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceCategory",
    required: true,
  },
  name: { type: String, unique: true, required: true },
  uniqueURL: { type: String, required: true },
  image: String,
});

const SubProductSchema = new mongoose.Schema({
  serviceCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceCategory",
    required: true,
  },
  subServiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceSubCategory",
    required: true,
  },
  name: { type: String, unique: true, required: true },
  uniqueURL: { type: String, required: true },
  description: { type: String, unique: true, required: true },
  discount: { type: Number, required: true },
  price: { type: Number, required: true },
  image: String,
});

const ServiceCategory = mongoose.model(
  "ServiceCategory",
  ServiceCategorySchema
);
const ServiceBrand = mongoose.model("ServiceBrand", BrandSchema);
const ServiceProblem = mongoose.model("ServiceProblem", ProblemSchema);
const ServiceSubCategory = mongoose.model(
  "ServiceSubCategory",
  SubCategorySchema
);
const ServiceSubProduct = mongoose.model("ServiceSubProduct", SubProductSchema);

export {
  ServiceCategory,
  ServiceBrand,
  ServiceProblem,
  ServiceSubCategory,
  ServiceSubProduct,
};
// module.exports = { ServiceCategory, Brand, Problem, SubCategory };
