import Category from "../models/categoryModel.js";
import Question from "../models/questionModel.js";

export const getAllQuestions = async (req, res) => {
  try {
    // const questions = await Question.find();
    const questions = await Question.find().populate("category", "name");
    const questionCategory = await Question.find().populate("category", "name");
    console.log("questionCategory", questionCategory);

    res.status(200).json(questions);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getQuestions = async (req, res) => {
  const catId = req.param.catId;

  const questions = Question.findById(catId);
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
        // await Category.findByIdAndUpdate(category, {
        //   questions: createdQuestions._id,
        // });

        // categoryFound.save();

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
