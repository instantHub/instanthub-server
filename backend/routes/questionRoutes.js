import express from "express";
import {
  createCondtionLabel,
  createCondtions,
  getConditionLabels,
  getConditions,
  updateCondition,
  updateConditionLabel,
  deleteConditionLabel,
  deleteCondition,

  //Variant Questions
  getVariantsQuestions,
  createVariantQuestions,
  updateVariantQuestions,
  getSingleProduct,
  deleteVariantQuestions,
} from "../controllers/questionController.js";

const router = express.Router();

// New Questions Structures Routes
// Contions routes
router.get("/conditions", getConditions);
router.post("/add-conditions", createCondtions);
router.put("/update-condition/:conditionId", updateCondition);
router.delete("/delete-condition", deleteCondition);

// ConditionLabels routes
router.get("/conditionlabels", getConditionLabels);
router.post("/add-conditionlabel", createCondtionLabel);
router.put("/update-conditionlabel/:conditionLabelId", updateConditionLabel);
router.delete("/delete-conditionlabel", deleteConditionLabel);

// Variant wise Questions
router.get("/single-product", getSingleProduct);
router.get("/variants-questions", getVariantsQuestions);
router.post("/add-variant-questions", createVariantQuestions);
router.put(
  "/update-variant-questions/:variantQuestionsId",
  updateVariantQuestions
);
router.delete(
  "/delete-variant-questions/:variantQuestionsId",
  deleteVariantQuestions
);

export default router;
