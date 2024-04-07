import Category from "../models/categoryModel.js";
import Question from "../models/questionModel.js";
import Product from "../models/productModel.js";
import Condition from "../models/conditionModel.js";
import ConditionLabel from "../models/conditionLabelModel.js";
import path from "path";
import fs from "fs";

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

// Get Condtiions
export const getConditions = async (req, res) => {
  console.log("getConditions controller");
  try {
    // console.log("before");
    const conditions = await Condition.find().populate("category", "name");
    // console.log(conditions);
    // console.log("after");
    res.status(200).json(conditions);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

// Create Conditions
export const createCondtions = async (req, res) => {
  const { category, conditionNames } = req.body;

  try {
    // Fetch existing conditions for the given category
    const existingConditions = await Condition.find({ category });
    const productsToAddCon = await Product.find({ category });

    // Extract existing condition names
    const existingConditionNames = existingConditions.map(
      (condition) => condition.conditionName
    );

    // Check for duplicate condition names
    const duplicateConditionNames = conditionNames.filter((conditionName) =>
      existingConditionNames.includes(conditionName)
    );

    // Return if duplicates found
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
    console.log(newConditions);

    // Create new deductions to add into the products
    const newDeductions = newConditions.map((condition) => ({
      conditionId: condition.id,
      conditionName: condition.conditionName,
      conditionLabel: [], // Initialize with an empty array
    }));

    // Update "deductions" field of all the products of this category
    await Product.updateMany(
      { category: category }, // Update products of a specific category
      { $push: { deductions: { $each: newDeductions } } }
    );

    return res.status(201).json(newConditions);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

export const updateCondition = async (req, res) => {
  try {
    const conditionId = req.params.conditionId;
    console.log("updateCondition Controller");
    console.log("req.body", req.body);

    const conditionFound = await Condition.findById(conditionId);

    // Find all products of the same category
    const productsToUpdate = await Product.find({
      category: conditionFound.category,
    });
    // console.log("productsToUpdate", productsToUpdate);

    // NEW APPROACH TO UPDATE PRODUCTS DEDUCTIONS CONDITION
    for (const product of productsToUpdate) {
      product.deductions.forEach((deduction) => {
        if (deduction.conditionId === conditionId) {
          deduction.conditionName = req.body.conditionName;
        }
      });

      // Save the updated product
      await product.save();
    }

    // Use Mongoose to find the question by ID and update it with the provided updates
    const updatedCondition = await Condition.findByIdAndUpdate(
      conditionId,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedCondition); // Send the updated question as a response
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Delete ConditionLabel
export const deleteCondition = async (req, res) => {
  const category = req.query.category;
  const conditionId = req.query.conditionId;
  console.log("Delete Condition controller");
  console.log(category, conditionId);
  try {
    const deletedCondition = await Condition.findByIdAndDelete(conditionId);
    console.log("deletedCondition", deletedCondition);
    const associatedConditionLabels = await ConditionLabel.find({
      conditionNameId: conditionId,
    });
    console.log("associatedConditionLabels", associatedConditionLabels);

    // call deleteImages function for each conditionLabel of the condition and unlink its images
    associatedConditionLabels.map((conditionLabel) => {
      deleteImages(conditionLabel.conditionLabelImg);
    });

    const deletedConditionLabels = await ConditionLabel.deleteMany({
      conditionNameId: conditionId,
    });
    console.log(
      "Deleted ",
      deletedConditionLabels.deletedCount,
      " associated conditionLabels"
    );

    // Step 2: Update products to remove the deleted condition
    await Product.updateMany(
      {
        category: category, // Match by category
        "deductions.conditionId": conditionId, // Match by conditionId
      },
      {
        $pull: {
          deductions: { conditionId: conditionId }, // Remove the entire deduction object
        },
      }
    );

    // Delete the corresponding image file from the uploads folder
    function deleteImages(conditionLabelImg) {
      const __dirname = path.resolve();
      const imagePath = path.join(__dirname, conditionLabelImg);
      console.log("imagePath", conditionLabelImg);

      fs.unlink(imagePath, (err) => {
        // fs.unlink(deletedLabel.conditionLabelImg, (err) => {
        if (err) {
          console.error("Error deleting image:", err);
          return res.status(500).json({ message: "Error deleting image" });
        }
        console.log("Image deleted successfully");
      });
    }

    return res.status(201).json(deletedCondition);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

// Get ConditionLabels
export const getConditionLabels = async (req, res) => {
  console.log("getConditionLabels controller");
  try {
    console.log("before");
    const conditionLabels = await ConditionLabel.find()
      .populate("category", "name")
      .populate("conditionNameId", "conditionName");

    // console.log(conditionLabels);
    console.log("after");
    res.status(200).json(conditionLabels);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

// Create ConditionLabel
export const createCondtionLabel = async (req, res) => {
  console.log("CreateConditionLabel controller");
  const { category, condition, conditionLabel, conditionLabelImg } = req.body;
  console.log(category, condition, typeof conditionLabel, conditionLabelImg);
  try {
    // Fetch existing ConditionLabel for the given condition
    const existingConditions = await ConditionLabel.find({
      conditionNameId: condition,
    });
    // console.log("existingConditions", existingConditions);

    // Create new conditions
    const newConditionLabel = await ConditionLabel.create({
      category,
      conditionNameId: condition,
      conditionLabel: conditionLabel,
      conditionLabelImg: conditionLabelImg,
    });

    await Product.updateMany(
      {
        category: category, // Add any other conditions if needed
        "deductions.conditionId": condition, // Match by conditionId
      },
      {
        $push: {
          "deductions.$.conditionLabels": {
            conditionLabelId: newConditionLabel._id,
            conditionLabel: newConditionLabel.conditionLabel,
            conditionLabelImg: newConditionLabel.conditionLabelImg,
            // priceDrop: newConditionLabel.priceDrop,
          },
        },
      }
    );

    return res.status(201).json(newConditionLabel);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

export const updateConditionLabel = async (req, res) => {
  const conditionLabelId = req.params.conditionLabelId;
  console.log("updateConditionLabel Controller");
  console.log("conditionLabelId", conditionLabelId);

  const { category, conditionNameId, conditionLabel, conditionLabelImg } =
    req.body;
  // console.log(category, conditionNameId, conditionLabel, conditionLabelImg);
  // console.log("req.body", req.body);

  try {
    // Use Mongoose to find the updatedConditionLabel by ID and update it with the provided updates
    const updatedConditionLabel = await ConditionLabel.findByIdAndUpdate(
      conditionLabelId,
      req.body,
      { new: true }
    );

    // Update the conditionLabels using the provided category, conditionId, and conditionLabelId
    await Product.updateMany(
      {
        category: category, // Match by category
        "deductions.conditionId": conditionNameId, // Match by conditionId
        "deductions.conditionLabels.conditionLabelId": conditionLabelId, // Match by conditionLabelId
      },
      {
        $set: {
          "deductions.$[outer].conditionLabels.$[inner].conditionLabel":
            conditionLabel,
          "deductions.$[outer].conditionLabels.$[inner].conditionLabelImg":
            conditionLabelImg,
        },
      },
      {
        arrayFilters: [
          { "outer.conditionId": conditionNameId },
          { "inner.conditionLabelId": conditionLabelId },
        ],
      }
    );

    return res.status(201).json(updatedConditionLabel);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

// Delete ConditionLabel
export const deleteConditionLabel = async (req, res) => {
  const category = req.query.category;
  const conditionLabelId = req.query.conditionLabelId;
  // const paramss = req.query;
  console.log("Delete ConditionLabel controller");
  // const { category } = req.body;
  console.log(category, conditionLabelId);
  // console.log(paramss);
  try {
    // Step 1: Delete the conditionLabel
    // const deleteLabel = await ConditionLabel.deleteOne({
    //   _id: conditionLabelId,
    // });
    const deletedLabel = await ConditionLabel.findByIdAndDelete(
      conditionLabelId
    );
    // console.log("deletedLabel", deletedLabel);

    // Step 2: Update products to remove the deleted conditionLabel
    await Product.updateMany(
      {
        category: category, // Add any other conditions if needed
        "deductions.conditionLabels.conditionLabelId": conditionLabelId, // Match by conditionLabelId
      },
      {
        $pull: {
          "deductions.$[].conditionLabels": { conditionLabelId },
        },
      }
    );

    // Delete the corresponding image file from the uploads folder
    const __dirname = path.resolve();
    const imagePath = path.join(__dirname, deletedLabel.conditionLabelImg);
    console.log("imagePath", deletedLabel.conditionLabelImg);

    fs.unlink(imagePath, (err) => {
      // fs.unlink(deletedLabel.conditionLabelImg, (err) => {
      if (err) {
        console.error("Error deleting image:", err);
        return res.status(500).json({ message: "Error deleting image" });
      }
      console.log("Image deleted successfully");
    });

    return res.status(201).json(deletedLabel);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};
