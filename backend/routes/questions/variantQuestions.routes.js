import express from "express";

import {
  createVariantQuestionsByCategory,
  deleteVariantQuestionsByCategory,
  getProductsWithDeductionsByCategory,
  getSingleVariantQuestions,
  getVariantsQuestionsByCategory,
  updateVariantQuestionsByCategory,
} from "../../controllers/questions/variantQuestions.controller.js";

const router = express.Router();

// Variant wise Questions
router.get("/:categoryId", getVariantsQuestionsByCategory);
router.get("/single/:variantQuestionId", getSingleVariantQuestions);
router.get(
  "/deductionsByCategory/:categoryId",
  getProductsWithDeductionsByCategory
);
router.post("/", createVariantQuestionsByCategory);
router.put("/:variantQuestionsId", updateVariantQuestionsByCategory);
router.delete("/:variantQuestionsId", deleteVariantQuestionsByCategory);

export default router;
