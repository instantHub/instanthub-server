import express from "express";
import {
  createCondtionLabels,
  createCondtions,
  createQuestions,
  getAllQuestions,
  getConditions,
  getQuestions,
  updateQuestions,
} from "../controllers/questionController.js";

const router = express.Router();

// router.get("/", getAllQuestions);
// router.get("/:questionsId", getQuestions);
// router.post("/add-questions", createQuestions);
// router.put("/update-questions/:questionsId", updateQuestions);
// router.put("/update-questions", updateQuestions);

// New Questions Structures Routes
router.get("/conditions", getConditions);
router.post("/add-conditions", createCondtions);
router.post("/add-conditionlabels", createCondtionLabels);

export default router;
