import express from "express";
import {
  createQuestions,
  getAllQuestions,
  getQuestions,
} from "../controllers/questionController.js";

const router = express.Router();

router.get("/", getAllQuestions);
router.get("/:catId", getQuestions);
router.post("/add-questions", createQuestions);

export default router;
