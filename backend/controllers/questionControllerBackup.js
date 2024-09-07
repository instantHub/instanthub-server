import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import Condition from "../models/conditionModel.js";
import ConditionLabel from "../models/conditionLabelModel.js";
import { VariantQuestion } from "../models/variantQuestionModel.js";
import path from "path";
import fs from "fs";

// Get Conditions
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
  console.log("createCondtions Controller");
  // const { category, conditionNames } = req.body;
  const { category, conditionName, page } = req.body;
  // console.log(req.body);

  try {
    // Fetch existing conditions for the given category
    const existingConditions = await Condition.find({ category });
    const conditionCategory = await Category.findById(category);
    // console.log("category", conditionCategory);

    // Extract existing condition names
    const existingConditionNames = existingConditions.map(
      (condition) => condition.conditionName
    );

    // Check for duplicate condition names
    const duplicateConditionName =
      existingConditionNames.includes(conditionName);
    // const duplicateConditionNames = conditionNames.filter((conditionName) =>
    //   existingConditionNames.includes(conditionName)
    // );

    // Return if duplicates found
    if (duplicateConditionName) {
      return res.status(201).json({
        message: "Duplicate condition names found for this category.",
        duplicateConditionName,
      });
    }

    // Create new conditions
    const newCondition = await Condition.create({
      category,
      conditionName,
      page,
    });

    // console.log("newCondition", newCondition);

    const variantsQuestions = await VariantQuestion.find();

    // Create new deductions to add into the products
    const newDeduction = {
      conditionId: newCondition._id,
      conditionName: newCondition.conditionName,
      page: newCondition.page,
      conditionLabels: [], // Initialize with an empty array
    };
    // console.log("newDeduction", newDeduction);

    // const newDeductions = newConditions.map((condition) => ({
    //   conditionId: condition.id,
    //   conditionName: condition.conditionName,
    //   conditionLabels: [], // Initialize with an empty array
    // }));

    const updatedProducts = [];

    if (conditionCategory.name === "Mobile") {
      // Find all products of the specific category
      const products = await Product.find({ category: category });
      for (const product of products) {
        // Iterate over each variantDeduction of the product
        product.variantDeductions.forEach((vd) => {
          // Iterate over each new deduction and push it to the deductions array
          // newDeductions.forEach((newDe) => {
          vd.deductions.push(newDeduction);
          // });
        });

        // Save the updated product
        const updatedProduct = await product.save();

        // Push the updated product to the array
        updatedProducts.push(updatedProduct);
      }

      // Create and Push New Condition from VARIANTS QUESTIONS as well
      for (const vq of variantsQuestions) {
        // Find the condition to update in the deductions array
        vq.deductions.push(newDeduction);
        vq.save();
      }
    } else if (conditionCategory.name !== "Mobile") {
      // Update "deductions" field of all the products of this category
      await Product.updateMany(
        { category: category }, // Update products of a specific category
        { $push: { simpleDeductions: newDeduction } }
        // { $push: { simpleDeductions: { $each: newDeduction } } }
      );
    }

    // console.log("updateProducts", updatedProducts);

    return res.status(201).json({
      message: "Successfully Created.",
      newCondition,
      updatedProducts,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

// Update condition
export const updateCondition = async (req, res) => {
  try {
    const conditionId = req.params.conditionId;
    console.log("updateCondition Controller");
    // console.log("req.body", req.body);

    const conditionFound = await Condition.findById(conditionId);
    const conditionCategory = await Category.findById(conditionFound.category);
    // console.log("conditionCategory", conditionCategory);

    const variantsQuestions = await VariantQuestion.find();
    // console.log("variantsQuestions", variantsQuestions);

    // Find all products of the same category
    const productsToUpdate = await Product.find({
      category: conditionFound.category,
    });
    // console.log("productsToUpdate", productsToUpdate);

    // NEW APPROACH TO UPDATE PRODUCTS DEDUCTIONS CONDITION
    if (conditionCategory.name === "Mobile") {
      // Iterate over each product
      for (const product of productsToUpdate) {
        // Iterate over each variantDeduction of the product
        for (const vd of product.variantDeductions) {
          // Find the condition to update in the deductions array
          vd.deductions.forEach((deduction) => {
            if (deduction.conditionId === conditionId) {
              deduction.conditionName = req.body.conditionName;
              deduction.page = req.body.page;
            }
          });
        }
        product.save();
      }

      // Update ConditionName from VARIANTS QUESTIONS as well
      for (const vq of variantsQuestions) {
        // Find the condition to update in the deductions array
        vq.deductions.forEach((deduction) => {
          // console.log("vq deduction", deduction);
          if (deduction.conditionId === conditionId) {
            // console.log("found conditionId", deduction.conditionId);
            deduction.conditionName = req.body.conditionName;
            deduction.page = req.body.page;
          }
        });
        vq.save();
      }

      // Save the updated products
      // const updatedProducts = await Promise.all(
      //   productsToUpdate.map((product) => product.save())
      // );
    } else if (conditionCategory.name !== "Mobile") {
      for (const product of productsToUpdate) {
        product.simpleDeductions.forEach((deduction) => {
          if (deduction.conditionId === conditionId) {
            deduction.conditionName = req.body.conditionName;
            deduction.page = req.body.page;
          }
        });

        // Save the updated product
        await product.save();
      }
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

// Delete Condition
export const deleteCondition = async (req, res) => {
  const category = req.query.category;
  const conditionId = req.query.conditionId;
  console.log("Delete Condition controller");
  // console.log("category", category, "conditionId", conditionId);
  try {
    const conditionCategory = await Category.findById(category);
    // console.log("conditionCategory", conditionCategory);
    const deletedCondition = await Condition.findByIdAndDelete(conditionId);
    // console.log("deletedCondition", deletedCondition);

    const variantsQuestions = await VariantQuestion.find();

    const associatedConditionLabels = await ConditionLabel.find({
      conditionNameId: conditionId,
    });
    // console.log("associatedConditionLabels", associatedConditionLabels);

    // call deleteImages function for each conditionLabel of the condition and unlink its images
    associatedConditionLabels.map((conditionLabel) => {
      if (conditionLabel.conditionLabelImg) {
        deleteImages(conditionLabel.conditionLabelImg);
      } else {
        console.log("Image not available");
      }
    });

    // const associatedConditionLabels = await ConditionLabel.find({
    //   conditionNameId: conditionId,
    // });

    const deletedConditionLabels = await ConditionLabel.deleteMany({
      conditionNameId: conditionId,
    });

    console.log(
      "Deleted ",
      deletedConditionLabels.deletedCount,
      " associated conditionLabels"
    );

    // Step 2: Update products to remove the deleted condition
    if (conditionCategory.name.toLowerCase().includes("mobile")) {
      // Find all products of the specific category
      const products = await Product.find({ category: category });

      // Iterate over each product
      for (const product of products) {
        // Iterate over each variantDeduction of the product
        for (const vd of product.variantDeductions) {
          // Find the index of the condition to delete in the deductions array
          const index = vd.deductions.findIndex(
            (d) => d.conditionId === conditionId
          );
          // console.log("vd", vd);
          // console.log("index", index);
          if (index !== -1) {
            // Remove the condition from the deductions array
            vd.deductions.splice(index, 1);
          }
        }
      }

      // Save the updated products
      const updatedProducts = await Promise.all(
        products.map((product) => product.save())
      );

      // Delete Condition from Varianst Questions
      for (const vq of variantsQuestions) {
        // Find the index of the condition to delete in the deductions array
        const index = vq.deductions.findIndex(
          (d) => d.conditionId === conditionId
        );
        if (index !== -1) {
          // Remove the condition from the deductions array
          vq.deductions.splice(index, 1);
        }
        vq.save();
      }
    } else if (conditionCategory.name !== "Mobile") {
      await Product.updateMany(
        {
          category: category, // Match by category
          "simpleDeductions.conditionId": conditionId, // Match by conditionId
        },
        {
          $pull: {
            simpleDeductions: { conditionId: conditionId }, // Remove the entire deduction object
          },
        }
      );
    }

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
    console.log("Error while deleting condition:- ", error.message);
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

// Get ConditionLabels
export const getConditionLabels = async (req, res) => {
  console.log("getConditionLabels controller");
  try {
    // console.log("before");
    const conditionLabels = await ConditionLabel.find()
      .populate("category", "name")
      .populate("conditionNameId", "conditionName");

    // console.log(conditionLabels);
    res.status(200).json(conditionLabels);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

// Create ConditionLabel
export const createCondtionLabel = async (req, res) => {
  console.log("CreateConditionLabel controller");
  const { category, conditionNameId, conditionLabel, conditionLabelImg } =
    req.body;
  // console.log(category, conditionNameId, conditionLabel, conditionLabelImg);
  try {
    // Fetch existing ConditionLabel for the given condition
    const allConditionLabels = await ConditionLabel.find({
      conditionNameId: conditionNameId,
    });
    const cLCategory = await Category.findById(category);
    // console.log("cLCategory", cLCategory);
    // console.log("allConditionLabels", allConditionLabels);

    const variantsQuestions = await VariantQuestion.find();

    // Extract existing condition names
    const existingConditionLabels = allConditionLabels.map(
      (cl) =>
        cl.conditionNameId == conditionNameId &&
        cl.conditionLabel == conditionLabel
    );
    // console.log("existingConditionLabels", existingConditionLabels);

    // Check for duplicate condition names
    const duplicateConditionLabel = existingConditionLabels.includes(true);

    // console.log("duplicateConditionLabel", duplicateConditionLabel);

    // Return if duplicates found
    if (duplicateConditionLabel) {
      return res.status(200).json({
        message: "Duplicate condition names found for this condition.",
        conditionLabel,
      });
    }

    // Create new conditions
    const newConditionLabel = await ConditionLabel.create({
      category,
      conditionNameId: conditionNameId,
      conditionLabel: conditionLabel,
      conditionLabelImg: conditionLabelImg,
    });
    // console.log("created newConditionLabel", newConditionLabel);

    // Find all products of the specific category
    const products = await Product.find({ category: category });

    if (cLCategory.name === "Mobile") {
      // Update "deductions" field of all products of the specific category
      const updatedProducts = await Product.updateMany(
        {
          category: category,
          "variantDeductions.variantName": { $exists: true },
        }, // Find products with variants
        {
          $push: {
            "variantDeductions.$[variant].deductions.$[condition].conditionLabels":
              {
                // conditionNameId: conditionNameId,
                conditionLabelId: newConditionLabel._id,
                conditionLabel: newConditionLabel.conditionLabel,
                conditionLabelImg: newConditionLabel.conditionLabelImg,
                operation: "Subtrack",
              },
          },
        }, // Push new condition label to condition labels array
        {
          arrayFilters: [
            { "variant.variantName": { $exists: true } },
            { "condition.conditionId": conditionNameId },
          ],
        } // Array filters to match variant and condition
      );
      // console.log("updatedProducts", updatedProducts);

      // Update Variants Questions Condition Labels as well
      await VariantQuestion.updateMany(
        {},
        {
          $push: {
            "deductions.$[condition].conditionLabels": {
              conditionLabelId: newConditionLabel._id,
              conditionLabel: newConditionLabel.conditionLabel,
              conditionLabelImg: newConditionLabel.conditionLabelImg,
              operation: "Subtrack",
            },
          },
        },
        {
          arrayFilters: [{ "condition.conditionId": conditionNameId }],
        }
      );
    } else if (cLCategory.name !== "Mobile") {
      await Product.updateMany(
        {
          category: category, // Add any other conditions if needed
          "simpleDeductions.conditionId": conditionNameId, // Match by conditionId
        },
        {
          $push: {
            "simpleDeductions.$.conditionLabels": {
              conditionLabelId: newConditionLabel._id,
              conditionLabel: newConditionLabel.conditionLabel,
              conditionLabelImg: newConditionLabel.conditionLabelImg,
              operation: "Subtrack",
              // priceDrop: newConditionLabel.priceDrop,
            },
          },
        }
      );
    }

    return res.status(201).json({
      newConditionLabel: newConditionLabel,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

// Update conditionLabel
export const updateConditionLabel = async (req, res) => {
  const conditionLabelId = req.params.conditionLabelId;
  console.log("updateConditionLabel Controller");
  // console.log("conditionLabelId", conditionLabelId);

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
    const cLCategory = await Category.findById(category);
    // console.log("cLCategory", cLCategory);

    // Update the conditionLabels using the provided category, conditionId, and conditionLabelId

    if (cLCategory.name === "Mobile") {
      const updatedProducts = await Product.updateMany(
        {
          category: category,
          "variantDeductions.variantName": { $exists: true },
        }, // Find products with variants
        {
          // $addToSet: {
          // $set: {
          //   // "variantDeductions.$[variant].deductions.$[condition].conditionLabels.$[label]":
          //   "variantDeductions.$[variant].deductions.$[condition].conditionLabels.$[label]":
          //     {
          //       conditionLabel: conditionLabel,
          //       conditionLabelImg: conditionLabelImg,
          //       operation: "Subtrack",
          //     },
          // },

          $set: {
            "variantDeductions.$[variant].deductions.$[condition].conditionLabels.$[label].conditionLabel":
              conditionLabel,
            "variantDeductions.$[variant].deductions.$[condition].conditionLabels.$[label].conditionLabelImg":
              conditionLabelImg,
          },
        }, // Push new condition label to condition labels array
        {
          arrayFilters: [
            { "variant.variantName": { $exists: true } },
            { "condition.conditionId": conditionNameId },
            { "label.conditionLabelId": conditionLabelId },
          ],
        } // Array filters to match variant and condition
      );
      // console.log("updatedProducts", updatedProducts);

      // Update Variants Questions Condition Labels as well
      await VariantQuestion.updateMany(
        {},
        {
          $set: {
            "deductions.$[condition].conditionLabels.$[label].conditionLabel":
              conditionLabel,
            "deductions.$[condition].conditionLabels.$[label].conditionLabelImg":
              conditionLabelImg,
          },
        },
        {
          arrayFilters: [
            { "condition.conditionId": conditionNameId },
            { "label.conditionLabelId": conditionLabelId },
          ],
        }
      );
    } else if (cLCategory.name !== "Mobile") {
      await Product.updateMany(
        {
          category: category, // Match by category
          "simpleDeductions.conditionId": conditionNameId, // Match by conditionId
          "simpleDeductions.conditionLabels.conditionLabelId": conditionLabelId, // Match by conditionLabelId
        },
        {
          $set: {
            "simpleDeductions.$[outer].conditionLabels.$[inner].conditionLabel":
              conditionLabel,
            "simpleDeductions.$[outer].conditionLabels.$[inner].conditionLabelImg":
              conditionLabelImg,
            // "simpleDeductions.$[outer].conditionLabels.$[inner].operation":
            //   "Subtrack",
          },
        },
        {
          arrayFilters: [
            { "outer.conditionId": conditionNameId },
            { "inner.conditionLabelId": conditionLabelId },
          ],
        }
      );
    }

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
  // console.log(category, conditionLabelId);
  try {
    // Step 1: Delete the conditionLabel
    const deletedLabel = await ConditionLabel.findByIdAndDelete(
      conditionLabelId
    );
    const cLCategory = await Category.findById(category);
    // console.log("cLCategory", cLCategory);
    // console.log("deletedLabel", deletedLabel);

    // Step 2: Update products to remove the deleted conditionLabel

    if (cLCategory.name === "Mobile") {
      // const updatedProducts = await Product.updateMany(
      //   {
      //     category: category,
      //     "variantDeductions.variantName": { $exists: true },
      //   }, // Find products with variants
      //   {
      //     $pull: {
      //       "variantDeductions.$[].deductions.$[].conditionLabels": {
      //         conditionLabelId,
      //       },
      //     },
      //   } // Pull condition label from condition labels array
      // );

      const updatedProducts = await Product.updateMany(
        {
          category: category,
          "variantDeductions.variantName": { $exists: true },
        }, // Find products with variants
        {
          $pull: {
            "variantDeductions.$[].deductions.$[].conditionLabels": {
              conditionLabelId,
            },
          },
        }, // Pull condition label from condition labels array
        {
          arrayFilters: [
            { "variant.variantName": { $exists: true } },
            { "condition.conditionLabels.conditionLabelId": conditionLabelId },
          ],
        } // Array filters to match conditionLabelIdToDelete
      );
      // console.log("updatedProducts", updatedProducts);

      // Update Variants Questions Condition Labels as well
      await VariantQuestion.updateMany(
        {},
        {
          $pull: {
            "deductions.$[].conditionLabels": {
              conditionLabelId,
            },
          },
        },
        {
          arrayFilters: [{ "label.conditionLabelId": conditionLabelId }],
        }
      );
    } else if (cLCategory.name !== "Mobile") {
      await Product.updateMany(
        {
          category: category, // Add any other conditions if needed
          "simpleDeductions.conditionLabels.conditionLabelId": conditionLabelId, // Match by conditionLabelId
        },
        {
          $pull: {
            "simpleDeductions.$[].conditionLabels": { conditionLabelId },
          },
        }
      );
    }

    // Check if image is available
    if (deletedLabel.conditionLabelImg) {
      deleteImages(deletedLabel.conditionLabelImg);
    } else {
      console.log("Image not available");
    }

    // Delete the corresponding image file from the uploads folder
    function deleteImages(conditionLabelImg) {
      const __dirname = path.resolve();
      const imagePath = path.join(__dirname, conditionLabelImg);
      console.log("imagePath", conditionLabelImg);

      try {
        fs.unlink(imagePath, (err) => {
          if (err) {
            if (err.code === "ENOENT") {
              console.log(`Image ${imagePath} does not exist.`);
            } else {
              console.error(`Error deleting image ${imagePath}:`, err);
            }
          } else {
            console.log(`Image ${imagePath} deleted successfully.`);
          }
        });
      } catch (err) {
        console.error(`Error deleting image ${imagePath}:`, err);
      }
    }

    return res.status(201).json(deletedLabel);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

//  VARIANTS WISE QUESTIONS
export const getSingleProduct = async (req, res) => {
  console.log("getSingleProduct Controller");

  const categories = await Category.find();
  // console.log("categories", categories);

  const category = categories.find((cat) =>
    cat.name.toLowerCase().includes("mobile")
  );
  // console.log("category", category);

  const product = await Product.findOne({ category: category._id });
  // console.log("product", product);

  return res.status(201).json(product);
};

export const getVariantsQuestions = async (req, res) => {
  console.log("getVariantsQuestions Controller");
  const variantsQuestions = await VariantQuestion.find();
  // console.log("variantsQuestions", variantsQuestions);

  return res.status(201).json(variantsQuestions);
};

export const createVariantQuestions = async (req, res) => {
  console.log("createVariantQuestions Controller");
  // console.log("req body", req.body);

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
  // console.log("newVariantQuestion created", newVariantQuestion);

  return res.status(201).json(newVariantQuestion);
};

export const updateVariantQuestions = async (req, res) => {
  console.log("updateVariantQuestions Controller");
  // console.log("req", req.body);

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
  // console.log("updatedVariant", updatedVariant);

  return res.status(201).json(updatedVariant);
};

// Delete Condition
export const deleteVariantQuestions = async (req, res) => {
  console.log("deleteVariantQuestions controller");

  const variantQuestionsId = req.params.variantQuestionsId;
  // console.log("variantQuestionsId", variantQuestionsId);
  try {
    const deletedVariant = await VariantQuestion.findByIdAndDelete(
      variantQuestionsId
    );
    // console.log("deleted Variant", deletedVariant);

    return res.status(201).json(deletedVariant);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};
