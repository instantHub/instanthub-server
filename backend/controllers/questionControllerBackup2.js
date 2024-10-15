import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import Condition from "../models/conditionModel.js";
import ConditionLabel from "../models/conditionLabelModel.js";
import { VariantQuestion } from "../models/variantQuestionModel.js";
import path from "path";
import fs from "fs";
import Brand from "../models/brandModel.js";

// Get Conditions
export const getConditions = async (req, res) => {
  console.log("getConditions controller");
  try {
    const conditions = await Condition.find().populate("category", "name");
    res.status(200).json(conditions);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

// Create Conditions
export const createCondtions = async (req, res) => {
  console.log("createCondtions Controller");
  const { category, conditionName, page } = req.body;
  // console.log(req.body);

  try {
    // Fetch existing conditions for the given category
    const existingConditions = await Condition.find({ category });
    const conditionCategory = await Category.findById(category);
    // console.log("category", conditionCategory);

    let laptopDesktopCheck =
      conditionCategory.name === "Laptop" ||
      conditionCategory.name === "Desktop";

    console.log("laptopDesktopCheck", laptopDesktopCheck);

    const configCheck =
      conditionName.toLowerCase().includes("processor") ||
      conditionName.toLowerCase().includes("ram") ||
      conditionName.toLowerCase().includes("disk");

    console.log("configCheck", configCheck);

    // Before creating a condition for Laptop/Desktop at least one Windows & one IOS system must be created
    if (laptopDesktopCheck) {
      const APPLE_BRAND = await Brand.findOne({
        category: conditionCategory.id,
        name: "Apple",
        // name: conditionCategory.name === "Laptop" ? "Apple" : "iMac",
      });

      let NON_APPLE_BRAND = await Brand.findOne({
        category: conditionCategory.id,
        name: { $ne: "Apple" }, // Excludes brands with the name "Apple"
      });

      if (!NON_APPLE_BRAND || NON_APPLE_BRAND.products.length <= 0) {
        NON_APPLE_BRAND = await Brand.findOne({
          category: conditionCategory.id,
          name: { $nin: ["Apple", NON_APPLE_BRAND?.name || ""] }, // Excludes "Apple" and the previous brand name (if found)
        });
        console.log("NON_APPLE_BRAND of laptop 2", NON_APPLE_BRAND.name);
      }

      console.log("APPLE_BRAND of laptop", APPLE_BRAND.name);
      console.log("NON_APPLE_BRAND of laptop", NON_APPLE_BRAND.name);

      // const APPLE_PRODS = await Product.find({
      //   category: conditionCategory._id,
      //   brand: APPLE_BRAND?._id,
      // });

      // const WINDOWS_PRODS = await Product.find({
      //   category: conditionCategory._id,
      //   brand: { $ne: APPLE_BRAND?._id }, // $ne for "not equal" to Apple brand
      // });

      const APPLE_PROD_LEN = APPLE_BRAND?.products.length;
      const WINDOWS_PROD_LEN = NON_APPLE_BRAND?.products.length;

      console.log("APPLE_PROD_LEN ", APPLE_PROD_LEN);
      console.log("WINDOWS_PROD_LEN ", WINDOWS_PROD_LEN);

      // If no product exists: Need to create a product first
      if (APPLE_PROD_LEN <= 0 || WINDOWS_PROD_LEN <= 0) {
        console.log("Create Products in this category first..!");
        return res.status(201).json({
          message: `Create atleast one Windows AND one Apple(IOS) Product, to Create this Conditions.`,
        });
      }

      if (!configCheck) {
        const PROCESSOR_CONDITION = await Condition.findOne({
          category: category,
          conditionName: "Processor",
        });

        // console.log("PROCESSOR_CONDITION", PROCESSOR_CONDITION);

        const PROCESSORS_LIST = await ConditionLabel.find({
          conditionNameId: PROCESSOR_CONDITION?._id,
        });

        //
        let flag = PROCESSORS_LIST.length > 1 ? true : false;

        // console.log("B flag", flag);
        if (flag) {
          console.log("Flag if PROCESSORS_LIST.length > 1", flag);

          let appleCL = PROCESSORS_LIST.find((p) =>
            p.conditionLabel.includes("Apple")
          );
          if (appleCL) flag = true;
          else flag = false;
        }
        console.log("Final flag value after Apple processor check:", flag);

        if (!flag) {
          console.log("Each processor for Windows and Mac Required..!");
          return res.status(201).json({
            message: `Create atleast one Processor of Windows AND one MAC(IOS), to Create this Conditions.`,
          });
        }
      }
    }

    // Extract existing condition names
    const existingConditionNames = existingConditions.map(
      (condition) => condition.conditionName
    );

    // Check for duplicate condition names
    const duplicateConditionName =
      existingConditionNames.includes(conditionName);

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

    if (conditionCategory.name === "Mobile") {
      console.log("Creating condition for Mobiles");
      // Find all products of the specific category
      const productsUpdated = await Product.updateMany(
        {
          category: category, // Match products by category
        },
        {
          $push: {
            "variantDeductions.$[].deductions": newDeduction, // Push new deduction to each variantDeduction array
          },
        }
      );
      console.log("productsUpdated", productsUpdated);

      // Create and Push New Condition from VARIANTS QUESTIONS as well
      for (const vq of variantsQuestions) {
        // Find the condition to update in the deductions array
        vq.deductions.push(newDeduction);
        vq.save();
      }
    } else if (laptopDesktopCheck) {
      console.log("Creating condition for Laptops");

      // Update "deductions" field of all the products of this category
      if (configCheck) {
        console.log("Configuration Condition");
        const productsUpdated = await Product.updateMany(
          { category: category }, // Update products of a specific category
          { $push: { simpleDeductions: newDeduction } }
          // { $push: { simpleDeductions: { $each: newDeduction } } }
        );
        console.log("productsUpdated", productsUpdated);
      } else {
        console.log("Non Configuration Condition");
        const productsUpdated = await Product.updateMany(
          {
            category: category, // Match products by category
          },
          {
            $push: {
              "processorBasedDeduction.$[].deductions": newDeduction, // Push new deduction to each processorBasedDeduction array
            },
          }
        );
        console.log("productsUpdated", productsUpdated);
      }
    } else {
      console.log("Other category condition, updating all products");

      // Update "simpleDeductions" field of all the products of this category
      const productsUpdated = await Product.updateMany(
        { category: category }, // Update products of a specific category
        { $push: { simpleDeductions: newDeduction } }
      );

      console.log("productsUpdated", productsUpdated);
    }

    return res.status(201).json({
      message: "Successfully Created.",
      newCondition,
      // updatedProducts,
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

    let laptopDesktopCheck =
      conditionCategory.name === "Laptop" ||
      conditionCategory.name === "Desktop";

    console.log("laptopDesktopCheck", laptopDesktopCheck);

    // NEW APPROACH TO UPDATE PRODUCTS DEDUCTIONS CONDITION
    if (conditionCategory.name === "Mobile") {
      console.log("Updating condition of a mobile");
      // Find all products of the same category
      const productsUpdated = await Product.updateMany(
        {
          category: conditionFound.category,
          "variantDeductions.deductions.conditionId": conditionId, // Match conditionId in deductions
        },
        {
          $set: {
            "variantDeductions.$[].deductions.$[deduction].conditionName":
              req.body.conditionName,
            "variantDeductions.$[].deductions.$[deduction].page": req.body.page,
          },
        },
        {
          arrayFilters: [{ "deduction.conditionId": conditionId }], // Filter for deductions to update
        }
      );

      console.log("productsUpdated", productsUpdated);

      const variantsQuestions = await VariantQuestion.find();
      // console.log("variantsQuestions", variantsQuestions);

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
    } else if (laptopDesktopCheck) {
      console.log("Laptops condition to update");
      const configCheck =
        conditionFound.conditionName.toLowerCase().includes("processor") ||
        conditionFound.conditionName.toLowerCase().includes("ram") ||
        conditionFound.conditionName.toLowerCase().includes("disk");

      if (configCheck) {
        console.log("Config Deduction update");
        const productsUpdated = await Product.updateMany(
          {
            category: conditionCategory._id, // Match products by category
            "simpleDeductions.conditionId": conditionId, // Match the conditionId in the simpleDeductions array
          },
          {
            $set: {
              "simpleDeductions.$[elem].conditionName": req.body.conditionName,
              "simpleDeductions.$[elem].page": req.body.page,
            },
          },
          {
            arrayFilters: [{ "elem.conditionId": conditionId }], // Update the specific element in simpleDeductions array that matches conditionId
          }
        );
        console.log("productsUpdated", productsUpdated);
      } else {
        console.log("Non Config Deduction update");

        const productsUpdated = await Product.updateMany(
          {
            category: conditionCategory._id, // Match products by category
            "processorBasedDeduction.deductions.conditionId": conditionId, // Match the conditionId in the deductions array
          },
          {
            $set: {
              "processorBasedDeduction.$[].deductions.$[elem].conditionName":
                req.body.conditionName,
              "processorBasedDeduction.$[].deductions.$[elem].page":
                req.body.page,
            },
          },
          {
            arrayFilters: [{ "elem.conditionId": conditionId }], // Update the specific element that matches the conditionId
          }
        );

        console.log("productsUpdated", productsUpdated);
      }
    } else {
      console.log("Other category condition, updating in products");
      const productsUpdated = await Product.updateMany(
        {
          category: conditionFound.category, // Match by category
          "simpleDeductions.conditionId": conditionId, // Match the conditionId within simpleDeductions array
        },
        {
          $set: {
            "simpleDeductions.$[elem].conditionName": req.body.conditionName, // Update the conditionName
            "simpleDeductions.$[elem].page": req.body.page, // Update the page
          },
        },
        {
          arrayFilters: [
            { "elem.conditionId": conditionId }, // Array filter to apply the update to only the matching conditionId
          ],
        }
      );

      console.log("productsUpdated", productsUpdated);
    }

    // Use Mongoose to find the question by ID and update it with the provided updates
    const updatedCondition = await Condition.findByIdAndUpdate(
      conditionId,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedCondition); // Send the updated question as a response
  } catch (error) {
    console.log("Error while updating condition", error);
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

    const deletedConditionLabels = await ConditionLabel.deleteMany({
      conditionNameId: conditionId,
    });

    console.log(
      "Deleted ",
      deletedConditionLabels.deletedCount,
      " associated conditionLabels"
    );

    let laptopDesktopCheck =
      conditionCategory.name === "Laptop" ||
      conditionCategory.name === "Desktop";

    // Step 2: Update products to remove the deleted condition
    if (conditionCategory.name.toLowerCase().includes("mobile")) {
      // Find all products of the specific category
      const productsUpdated = await Product.updateMany(
        {
          category: category, // Match products by category
          "variantDeductions.deductions.conditionId": conditionId, // Match the conditionId in the deductions array within variantDeductions
        },
        {
          $pull: {
            "variantDeductions.$[].deductions": { conditionId: conditionId }, // Remove deduction where conditionId matches
          },
        }
      );
      console.log("productsUpdated", productsUpdated);

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
    } else if (laptopDesktopCheck) {
      console.log("Laptop/Desktop", laptopDesktopCheck);

      const configCheck =
        deletedCondition.conditionName.toLowerCase().includes("processor") ||
        deletedCondition.conditionName.toLowerCase().includes("ram") ||
        deletedCondition.conditionName.toLowerCase().includes("disk");

      const processorCond = deletedCondition.conditionName
        .toLowerCase()
        .includes("processor");

      if (configCheck) {
        console.log("Deleting config condition");
        const productsUpdated = await Product.updateMany(
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

        console.log("productsUpdated", productsUpdated);

        if (processorCond) {
          console.log("Deleting Processor Condition");
          const productsUpdated = await Product.updateMany(
            {
              category: category, // Match by category
            },
            {
              $set: {
                processorBasedDeduction: [], // Clear the processorBasedDeduction array
              },
            }
          );

          console.log("productsUpdated", productsUpdated);
        }
      } else {
        console.log("Deleting non-config condition");

        // Find all products of the specific category
        const productsUpdated = await Product.updateMany(
          {
            category: category, // Match by category
            "processorBasedDeduction.deductions.conditionId": conditionId, // Match by conditionId within the deductions array in processorBasedDeduction
          },
          {
            $pull: {
              "processorBasedDeduction.$[].deductions": {
                conditionId: conditionId,
              }, // Remove the deduction object where conditionId matches
            },
          }
        );

        console.log("productsUpdated", productsUpdated);
      }
    } else {
      console.log("Other category condition, deleting in products");
      const productsUpdated = await Product.updateMany(
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
      console.log("productsUpdated", productsUpdated);
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
  const {
    category,
    brand,
    conditionNameId,
    conditionLabel,
    conditionLabelImg,
  } = req.body;
  // console.log(category, conditionNameId, conditionLabel, conditionLabelImg);
  try {
    // Fetch existing ConditionLabel for the given condition
    const allConditionLabels = await ConditionLabel.find({
      conditionNameId: conditionNameId,
    });
    const cLCategory = await Category.findById(category);
    // console.log("cLCategory", cLCategory);
    // console.log("allConditionLabels", allConditionLabels);

    // const variantsQuestions = await VariantQuestion.find();

    // Extract existing condition names
    const existingConditionLabels = allConditionLabels.map(
      (cl) =>
        cl.conditionNameId == conditionNameId &&
        cl.conditionLabel == conditionLabel
    );
    // console.log("existingConditionLabels", existingConditionLabels);

    let laptopDesktopCheck =
      cLCategory.name === "Laptop" || cLCategory.name === "Desktop";

    // Before creating a condition label for Laptop/Desktop at least one Windows & one IOS system must be created
    if (laptopDesktopCheck) {
      const APPLE_BRAND = await Brand.findOne({
        category: cLCategory.id,
        name: "Apple",
        // name: cLCategory.name === "Laptop" ? "Apple" : "iMac",
      });

      const NON_APPLE_BRAND = await Brand.findOne({
        category: cLCategory.id,
        name: { $ne: "Apple" }, // Excludes brands with the name "Apple"
      });

      console.log("APPLE_BRAND of laptop", APPLE_BRAND.name);
      console.log("NON_APPLE_BRAND of laptop", NON_APPLE_BRAND.name);

      const APPLE_PROD_LEN = APPLE_BRAND?.products.length;
      const WINDOWS_PROD_LEN = NON_APPLE_BRAND?.products.length;

      console.log("APPLE_PROD_LEN ", APPLE_PROD_LEN);
      console.log("WINDOWS_PROD_LEN ", WINDOWS_PROD_LEN);

      // If no product exists: Need to create a product first
      if (APPLE_PROD_LEN <= 0 || WINDOWS_PROD_LEN <= 0) {
        console.log("Create Products in this category first..!");
        return res.status(201).json({
          message: `Create atleast one Windows AND one Apple(IOS) Product, to Create this Conditions Label.`,
        });
      }
    }

    // Check for duplicate condition names
    const duplicateConditionLabel = existingConditionLabels.includes(true);

    // console.log("duplicateConditionLabel", duplicateConditionLabel);

    // Return if duplicates found
    if (duplicateConditionLabel) {
      return res.status(200).json({
        message: "Duplicate condition label names found.",
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
    console.log("created newConditionLabel", newConditionLabel);

    if (cLCategory.name === "Mobile") {
      console.log("Updating created condition label into Mobiles");
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
      console.log("updatedProducts", updatedProducts);

      // Update Variants Questions Condition Labels as well
      const updatedVariantQuestions = await VariantQuestion.updateMany(
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
      console.log("updatedVariantQuestions", updatedVariantQuestions);
    } else if (laptopDesktopCheck) {
      console.log("Updating created condition label into Laptops");

      // Update "deductions" field of all the products of this category
      console.log("category", category, "conditionNameId", conditionNameId);

      const condition = await Condition.findById(conditionNameId);
      console.log("condition of the conditionLabel", condition);
      // debugger;

      const AppleBrand = await Brand.findOne({
        category: cLCategory.id,
        name: "Apple",
        // name: cLCategory.name === "Laptop" ? "Apple" : "iMac",
      });
      // console.log("Apple Brand", AppleBrand);
      let { name: appleBrandName, _id: appleBrandId } = AppleBrand;
      console.log("Brand Name & ID", appleBrandName, appleBrandId);

      const configCheck =
        condition.conditionName.toLowerCase().includes("processor") ||
        condition.conditionName.toLowerCase().includes("ram") ||
        condition.conditionName.toLowerCase().includes("disk");

      const processorCond = condition.conditionName
        .toLowerCase()
        .includes("processor");

      if (configCheck) {
        if (processorCond) {
          console.log("Processor Condition Labels");

          // name: cLCategory.name === "Laptop" ? "Apple" : "iMac",
          const updatedProducts = await Product.updateMany(
            {
              category: category, // Match by category
              brand:
                appleBrandName === brand ? appleBrandId : { $ne: appleBrandId }, // Dynamic brand match
              "simpleDeductions.conditionId": conditionNameId, // Match by conditionId
            },
            {
              $push: {
                "simpleDeductions.$.conditionLabels": {
                  conditionLabelId: newConditionLabel._id,
                  conditionLabel: newConditionLabel.conditionLabel,
                  conditionLabelImg: newConditionLabel.conditionLabelImg,
                  operation: "Subtrack",
                },
              },
            }
          );
          console.log("Updated updatedProducts", updatedProducts);

          const prod = await Product.findOne({ category });
          console.log("product of this System category", prod.name);

          const oldProcessorBasedDeductionExist =
            prod.processorBasedDeduction.length > 0;

          console.log(
            "oldProcessorBasedDeductionExist",
            oldProcessorBasedDeductionExist
          );

          const newProcBasDeduc = {
            processorId: newConditionLabel._id,
            processorName: newConditionLabel.conditionLabel,
            deductions: oldProcessorBasedDeductionExist
              ? prod.processorBasedDeduction[0].deductions
              : [],
          };

          const productProcDed = await Product.updateMany(
            {
              category: category, // Update products of a specific category
              brand:
                appleBrandName === brand ? appleBrandId : { $ne: appleBrandId },
            }, // Dynamic brand match

            { $push: { processorBasedDeduction: newProcBasDeduc } }
          );
          console.log("productProcDed", productProcDed);
        } else {
          console.log("Non Processor Condition Labels");
          const updatedProducts = await Product.updateMany(
            {
              category: category, // Match by category
              "simpleDeductions.conditionId": conditionNameId, // Match by conditionId
            },
            {
              $push: {
                "simpleDeductions.$.conditionLabels": {
                  conditionLabelId: newConditionLabel._id,
                  conditionLabel: newConditionLabel.conditionLabel,
                  conditionLabelImg: newConditionLabel.conditionLabelImg,
                  operation: "Subtrack",
                },
              },
            }
          );
          console.log("Updated updatedProducts", updatedProducts);
        }
      } else {
        console.log("Non Configurations, condition label");
        const updatedProducts = await Product.updateMany(
          {
            category: category, // Match documents by category
            "processorBasedDeduction.deductions.conditionId": conditionNameId, // Match by conditionId within deductions
          },
          {
            $push: {
              "processorBasedDeduction.$[processor].deductions.$[deduction].conditionLabels":
                {
                  conditionLabelId: newConditionLabel._id,
                  conditionLabel: newConditionLabel.conditionLabel,
                  conditionLabelImg: newConditionLabel.conditionLabelImg,
                  operation: "Subtrack", // or "Subtrack" if that was a typo
                },
            },
          },
          {
            arrayFilters: [
              { "processor.deductions.conditionId": conditionNameId }, // Filter for matching deductions by conditionId
              { "deduction.conditionId": conditionNameId }, // Ensure deduction matches the conditionId
            ],
            multi: true, // Update multiple documents
          }
        );

        console.log("updatedProducts", updatedProducts);
      }
    } else {
      console.log("Other category conditionLabel, updating in all products");

      const updatedProducts = await Product.updateMany(
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
      console.log("updatedProducts", updatedProducts);
    }

    return res.status(201).json({
      newConditionLabel: newConditionLabel,
    });
  } catch (error) {
    console.log("Error while creating conditionLabel:", error.message);
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

    let laptopDesktopCheck =
      cLCategory.name === "Laptop" || cLCategory.name === "Desktop";

    if (cLCategory.name === "Mobile") {
      console.log("Updating condition label into all Mobile products");
      const updatedProducts = await Product.updateMany(
        {
          category: category,
          "variantDeductions.variantName": { $exists: true },
        }, // Find products with variants
        {
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
      console.log("updatedProducts", updatedProducts);

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
    } else if (laptopDesktopCheck) {
      console.log("Updating condition label into all Laptop products");
      const condition = await Condition.findById(
        updatedConditionLabel.conditionNameId
      );
      console.log("condition of the conditionLabel", condition);

      const configCheck =
        condition.conditionName.toLowerCase().includes("processor") ||
        condition.conditionName.toLowerCase().includes("ram") ||
        condition.conditionName.toLowerCase().includes("disk");

      const processorCond = condition.conditionName
        .toLowerCase()
        .includes("processor");

      if (configCheck) {
        console.log("Config conditions to update");
        const productsUpdated = await Product.updateMany(
          {
            category: category, // Match by category
            "simpleDeductions.conditionId": conditionNameId, // Match by conditionId
            "simpleDeductions.conditionLabels.conditionLabelId":
              conditionLabelId, // Match by conditionLabelId
          },
          {
            $set: {
              "simpleDeductions.$[outer].conditionLabels.$[inner].conditionLabel":
                conditionLabel,
              "simpleDeductions.$[outer].conditionLabels.$[inner].conditionLabelImg":
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

        console.log("productsUpdated", productsUpdated);

        if (processorCond) {
          console.log("Updating conditionLabels of processorConditions ");

          const productsUpdated = await Product.updateMany(
            {
              category: category, // Match by category
              "processorBasedDeduction.processorId": conditionLabelId, // Match by processorId in processorBasedDeduction array
            },
            {
              $set: {
                "processorBasedDeduction.$[elem].processorName": conditionLabel, // Update the processorName
              },
            },
            {
              arrayFilters: [
                { "elem.processorId": conditionLabelId }, // Array filter to apply the update to the matching processorId
              ],
            }
          );

          console.log("productsUpdated", productsUpdated);
        }
      } else {
        console.log("Updating conditionLabel of non configuration conditions");

        const productsUpdated = await Product.updateMany(
          {
            "processorBasedDeduction.deductions.conditionId": conditionNameId, // Match documents where the conditionId in deductions matches conditionNameId
          },
          {
            $set: {
              "processorBasedDeduction.$[processor].deductions.$[deduction].conditionLabels.$[label].conditionLabel":
                conditionLabel, // Update the conditionLabel under matched conditionId
              "processorBasedDeduction.$[processor].deductions.$[deduction].conditionLabels.$[label].conditionLabelImg":
                conditionLabelImg, // Optionally update the conditionLabelImg
            },
          },
          {
            arrayFilters: [
              { "processor.deductions.conditionId": conditionNameId }, // Filter for matching processor deductions by conditionId
              { "deduction.conditionId": conditionNameId }, // Filter for matching deductions by conditionId
              { "label.conditionLabelId": conditionLabelId }, // Filter for matching conditionLabels by conditionLabelId
            ],
            multi: true, // Update multiple documents
          }
        );
        console.log("productsUpdated", productsUpdated);
      }
    } else {
      console.log("Other category conditionLabel, updating in all products");
      const productsUpdated = await Product.updateMany(
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

      console.log("productsUpdated", productsUpdated);
    }

    return res.status(201).json(updatedConditionLabel);
  } catch (error) {
    console.log("Error while updating conditionLabel:", error.message);
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
    console.log("deletedLabel", deletedLabel);

    // Check if image is available
    if (deletedLabel.conditionLabelImg) {
      deleteImages(deletedLabel.conditionLabelImg);
    } else {
      console.log("Image not available");
    }

    // Step 2: Update products to remove the deleted conditionLabel

    let laptopDesktopCheck =
      cLCategory.name === "Laptop" || cLCategory.name === "Desktop";

    if (cLCategory.name === "Mobile") {
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
      console.log("updatedProducts", updatedProducts);

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
    } else if (laptopDesktopCheck) {
      const condition = await Condition.findById(deletedLabel.conditionNameId);
      console.log("condition of the conditionLabel", condition);
      const configCheck =
        condition.conditionName.toLowerCase().includes("processor") ||
        condition.conditionName.toLowerCase().includes("ram") ||
        condition.conditionName.toLowerCase().includes("disk");

      const processorCond = condition.conditionName
        .toLowerCase()
        .includes("processor");

      if (configCheck) {
        console.log(
          "Deleting conditionLabel which are from configuration conditions"
        );
        const productsUpdated = await Product.updateMany(
          {
            category: category, // Add any other conditions if needed
            "simpleDeductions.conditionLabels.conditionLabelId":
              conditionLabelId, // Match by conditionLabelId
          },
          {
            $pull: {
              "simpleDeductions.$[].conditionLabels": { conditionLabelId },
            },
          }
        );

        console.log("productsUpdated", productsUpdated);

        if (processorCond) {
          console.log("Deleting Processor from Processor based deductions");
          const productsUpdated = await Product.updateMany(
            {
              "processorBasedDeduction.processorId": conditionLabelId, // Match documents where processorId matches the conditionLabelId
            },
            {
              $pull: {
                processorBasedDeduction: {
                  processorId: conditionLabelId, // Pull the specific processorBasedDeduction where processorId matches conditionLabelId
                },
              },
            }
          );

          console.log("productsUpdated", productsUpdated);
        }
      } else {
        console.log(
          "Deleting ConditionLabel which are not from configuration conditions"
        );
        const productsUpdated = await Product.updateMany(
          {
            category: category, // Match documents by category (if needed)
            "processorBasedDeduction.deductions.conditionId":
              deletedLabel.conditionNameId, // Match by conditionId within deductions
            "processorBasedDeduction.deductions.conditionLabels.conditionLabelId":
              conditionLabelId, // Match by conditionLabelId within conditionLabels
          },
          {
            $pull: {
              "processorBasedDeduction.$[processor].deductions.$[deduction].conditionLabels":
                {
                  conditionLabelId: conditionLabelId, // Pull the specific conditionLabel by ID
                },
            },
          },
          {
            arrayFilters: [
              {
                "processor.deductions.conditionId":
                  deletedLabel.conditionNameId,
              }, // Match specific conditionId in deductions
              { "deduction.conditionId": deletedLabel.conditionNameId }, // Ensure deduction matches the conditionId
            ],
            multi: true, // Update multiple documents
          }
        );
        console.log("productsUpdated", productsUpdated);
      }
    } else {
      console.log("Other category conditionLabel, deleting from all products");

      const productsUpdated = await Product.updateMany(
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
      console.log("productsUpdated", productsUpdated);
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

// Get a Single Products
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

// Get VariantQuestio
export const getVariantsQuestions = async (req, res) => {
  console.log("getVariantsQuestions Controller");
  const variantsQuestions = await VariantQuestion.find();
  // console.log("variantsQuestions", variantsQuestions);

  return res.status(201).json(variantsQuestions);
};

// Create VariantQuestio
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

// Update VariantQuestio
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

// Delete VariantQuestion
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
