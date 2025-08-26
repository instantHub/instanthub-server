import Category from "../../models/categoryModel.js";
import Product from "../../models/productModel.js";
import { VariantQuestion } from "../../models/variantQuestionModel.js";
import mongoose from "mongoose";

// Get VariantQuestions
export const getSingleVariantQuestions = async (req, res) => {
  console.log("getSingleVariantsQuestions Controller");

  try {
    const { variantQuestionId } = req.params;
    console.log("variantQuestionId", variantQuestionId);

    const variantQuestions = await VariantQuestion.findById(variantQuestionId);
    console.log("variantQuestions", variantQuestions);

    return res.status(201).json(variantQuestions);
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

// Get VariantQuestio
export const getVariantsQuestionsByCategory = async (req, res) => {
  console.log("getVariantsQuestions Controller");

  try {
    const { categoryId } = req.params;
    console.log("categoryId", categoryId);

    const variantsQuestions = await VariantQuestion.find({
      category: categoryId,
    });
    console.log("variantsQuestions", variantsQuestions);

    return res.status(201).json(variantsQuestions);
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

// Create VariantQuestions
export const createVariantQuestionsByCategory = async (req, res) => {
  console.log("createVariantQuestions Controller");

  // Check if dublicate variant name
  const variantQuestions = await VariantQuestion.find();
  const dublicate = variantQuestions.find((vq) => vq.name === req.body.name);
  if (dublicate) {
    console.log("Duplicate Variant Name");
    return res.status(201).json({ message: "Duplicate Variant..!" });
  }

  // CREATION
  const newVariantQuestion = await VariantQuestion.create(req.body);
  newVariantQuestion.save();
  //   console.log("newVariantQuestion created", newVariantQuestion);

  return res.status(201).json(newVariantQuestion);
};

// Update VariantQuestio
export const updateVariantQuestionsByCategory = async (req, res) => {
  console.log("updateVariantQuestions Controller");

  const variantQuestionsId = req.params.variantQuestionsId;

  const updatedVariantData = {
    name: req.body.name,
    deductions: req.body.deductions,
  };
  // console.log("updatedVariantData", updatedVariantData);

  const updatedVariant = await VariantQuestion.findByIdAndUpdate(
    variantQuestionsId,
    updatedVariantData,
    { new: true }
  );

  updatedVariant.save();
  return res.status(201).json(updatedVariant);
};

// Delete VariantQuestion
export const deleteVariantQuestionsByCategory = async (req, res) => {
  console.log("deleteVariantQuestions controller");

  const variantQuestionsId = req.params.variantQuestionsId;
  try {
    const deletedVariant = await VariantQuestion.findByIdAndDelete(
      variantQuestionsId
    );

    return res.status(201).json(deletedVariant);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

/**
 * Get products with deductions grouped by category
 */
export const getProductsWithDeductionsByCategory = async (req, res) => {
  console.log("getProductsWithDeductionsByCategory controller");

  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid categoryId",
      });
    }

    const category = await Category.findById(categoryId);

    const products = await Product.find({
      category: categoryId,
      variantDeductions: {
        $elemMatch: {
          deductions: { $exists: true, $ne: [] }, // at least one deductions array is non-empty
        },
      },
    });

    return res.status(200).json({
      success: true,
      category: category.name,
      products,
      count: products.length,
      message: "Products with non-empty variantDeductions",
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
