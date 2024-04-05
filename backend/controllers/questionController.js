import Category from "../models/categoryModel.js";
import Question from "../models/questionModel.js";
import Product from "../models/productModel.js";
import Condition from "../models/conditionModel.js";
import ConditionLabel from "../models/conditionLabelModel.js";

export const getAllQuestions = async (req, res) => {
  try {
    // const questions = await Question.find();
    const questions = await Question.find().populate("category", "name");
    const questionCategory = await Question.find().populate("category", "name");
    // console.log("questionCategory", questionCategory);

    res.status(200).json(questions);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getQuestions = async (req, res) => {
  try {
    const questionsId = req.params.questionsId;
    console.log(questionsId);
    const questionsFound = await Question.findById(questionsId).populate(
      "category",
      "name"
    );
    // console.log("questions", questionsFound);

    res.status(200).json(questionsFound);
    // res
    //   .status(200)
    //   .json({ msg: "success from getQuestions", data: questionsFound });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createQuestions = async (req, res) => {
  try {
    const { category, conditions } = req.body;
    const categoryFound = await Category.findById(category);

    const Questions = await Question.find();

    // Map over the conditions array and construct the questions array for each condition
    const questions = conditions.map(({ conditionName, questions }) => ({
      conditionName,
      questions: questions.map(({ questionName, priceDrop, options }) => ({
        questionName, // Include the questionName field
        priceDrop,
        options,
      })),
    }));

    if (Questions.length > 0) {
      let categoryPresent = false;

      Questions.map((questionsList) => {
        if (questionsList.category == category) {
          console.log("present");
          categoryPresent = true;
        }
      });

      if (categoryPresent == false) {
        // If category not present in Questions database then Create the questions in the database
        const createdQuestions = await Question.create({
          category,
          conditions: questions,
        });
        createdQuestions.save();
        // categoryFound.questions.push(createdQuestions);
        // Update the questions field in the Category schema with the newly created question's ID
        await Category.findByIdAndUpdate(category, {
          questions: createdQuestions._id,
        });

        categoryFound.save();

        res.status(201).json({ success: true, data: createdQuestions });
      } else if ((categoryPresent = true)) {
        res.status(200).send({
          msg:
            "Questions for the category " +
            categoryFound.name +
            " already exist ",
        });
      }
    } else {
      const createdQuestions = await Question.create({
        category,
        conditions: questions,
      });
      createdQuestions.save();
      //   categoryFound.questions.push(createdQuestions);
      await Category.findByIdAndUpdate(category, {
        questions: createdQuestions._id,
      });
      //   categoryFound.save();

      res.status(201).json({ success: true, data: createdQuestions });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }

  console.log("working");
};

export const updateQuestions = async (req, res) => {
  try {
    const questionsId = req.params.questionsId;
    console.log("questionsController UpdateQuestions");
    // console.log("req.body", req.body);

    const catId = req.body.category;
    console.log(catId);

    // NEW APPROACH
    const updatedQuestions = [req.body];
    console.log("updatedQuestions", updatedQuestions);

    // Find all products of the same category
    const productsToUpdate = await Product.find({
      category: catId,
      questions: { $exists: true, $ne: [] },
    });

    try {
      const updatedConditions = req.body.conditions;
      // My testing
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, error: "Error in udating products questions" });
    }

    // NEW APPROACH ENDS

    // Use Mongoose to find the question by ID and update it with the provided updates
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionsId,
      req.body,
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json(updatedQuestion); // Send the updated question as a response
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Create Condtiion
export const getConditions = async (req, res) => {
  console.log("getConditions controller");
  try {
    console.log("before");
    const conditions = await Condition.find();
    console.log(conditions);
    console.log("after");
    res.status(200).json(conditions);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

export const createCondtions = async (req, res) => {
  const { category, conditionNames } = req.body;

  try {
    // Fetch existing conditions for the given category
    const existingConditions = await Condition.find({ category });

    // Extract existing condition names
    const existingConditionNames = existingConditions.map(
      (condition) => condition.conditionName
    );

    // Check for duplicate condition names
    const duplicateConditionNames = conditionNames.filter((conditionName) =>
      existingConditionNames.includes(conditionName)
    );

    if (duplicateConditionNames.length > 0) {
      return res.status(400).json({
        message: "Duplicate condition names found for this category.",
        duplicateConditionNames,
      });
    }

    // Create new conditions
    const newConditions = await Condition.create(
      conditionNames.map((conditionName) => ({
        category,
        conditionName: conditionName.name,
      }))
    );

    return res.status(201).json(newConditions);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

export const createCondtionLabels = async (req, res) => {
  console.log("getConditionLabel controller");
  const { category, condition, conditionNames } = req.body;
};
