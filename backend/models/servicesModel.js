import mongoose from "mongoose";

const ServiceCategorySchema = mongoose.Schema({
  name: { type: String, unique: true, required: true },
  image: String,
  inspectionCharges: { type: Number, required: true },
  status: { type: String, required: true },
  uniqueURL: { type: String, required: true },
});

const BrandSchema = mongoose.Schema({
  serviceCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceCategory",
    required: true,
  },
  name: { type: String, required: true },
  uniqueURL: { type: String, required: true },
  image: String,
});

const ProblemSchema = mongoose.Schema({
  serviceCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceCategory",
    required: true,
  },
  name: { type: String, unique: true, required: true },
  description: String,
  image: String,
  price: Number,
});

const ServiceCategory = mongoose.model(
  "ServiceCategory",
  ServiceCategorySchema
);
const ServiceBrand = mongoose.model("ServiceBrand", BrandSchema);
const ServiceProblem = mongoose.model("ServiceProblem", ProblemSchema);

export { ServiceCategory, ServiceBrand, ServiceProblem };
