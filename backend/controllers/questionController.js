import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import Condition from "../models/conditionModel.js";
import ConditionLabel from "../models/conditionLabelModel.js";
import { VariantQuestion } from "../models/variantQuestionModel.js";

import Brand from "../models/brandModel.js";
import Processor from "../models/processorModel.js";
import { deleteImage } from "../utils/deleteImage.js";

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
  const {
    category,
    conditionName,
    page,
    keyword,
    isYesNoType,
    description,
    multiSelect,
  } = req.body;
  // console.log(req.body);

  try {
    // Fetch existing conditions for the given category
    const existingConditions = await Condition.find({ category });
    const conditionCategory = await Category.findById(category);
    // console.log("category", conditionCategory);

    let laptopDesktopCheck =
      conditionCategory.name === "Laptop" ||
      conditionCategory.name === "Desktop";

    const MULTI_VARIANTS = conditionCategory.categoryType.multiVariants;
    const PROCESSOR_BASED = conditionCategory.categoryType.processorBased;

    console.log("MULTI_VARIANTS", MULTI_VARIANTS);
    console.log("PROCESSOR_BASED", PROCESSOR_BASED);

    // console.log("laptopDesktopCheck", laptopDesktopCheck);

    const configCheck =
      conditionName.toLowerCase().includes("processor") ||
      conditionName.toLowerCase().includes("ram") ||
      conditionName.toLowerCase().includes("disk");

    console.log("configCheck", configCheck);

    // Before creating a condition for Laptop/Desktop at least one Windows & one IOS system must be created
    // if (laptopDesktopCheck) {
    if (PROCESSOR_BASED) {
      const APPLE_BRAND = await Brand.findOne({
        category: conditionCategory.id,
        name: "Apple",
      });

      const NON_APPLE_BRAND = await Brand.find({
        category: conditionCategory.id,
        name: { $ne: "Apple" }, // Excludes brands with the name "Apple"
      });

      console.log("APPLE_BRAND of laptop", APPLE_BRAND?.name);
      console.log("NON_APPLE_BRAND of laptop", NON_APPLE_BRAND[0]?.name);

      const APPLE_PROD_LEN = APPLE_BRAND?.products?.length || 0;
      // const WINDOWS_PROD_LEN = NON_APPLE_BRAND?.products?.length || 0;

      const WINDOWS_PROD_LEN = (NON_APPLE_BRAND || []).reduce(
        (total, brand) => {
          const count = brand?.products?.length || 0;
          return total + count;
        },
        0
      );

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

        console.log("PROCESSOR_CONDITION", PROCESSOR_CONDITION);

        const PROCESSORS_LIST = await ConditionLabel.find({
          conditionNameId: PROCESSOR_CONDITION?._id,
        });
        console.log("PROCESSORS_LIST", PROCESSORS_LIST);

        //
        let flag = PROCESSORS_LIST.length > 1 ? true : false;

        // console.log("B flag", flag);
        if (flag) {
          console.log("Flag if PROCESSORS_LIST.length > 1", flag);

          // NOTE: Each Apple processor should have Apple word in it
          let appleCL = PROCESSORS_LIST.find((p) =>
            p.conditionLabel.toLowerCase().includes("apple")
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
      ...req.body,
    });

    console.log("newCondition", newCondition);

    const variantsQuestions = await VariantQuestion.find();

    // Create new deductions to add into the products
    const conditionData = newCondition.toObject();

    const newDeduction = {
      ...conditionData,
      conditionId: conditionData._id, // rename _id to conditionId
      conditionLabels: [], // override or set additional fields
    };

    // Optionally remove _id if you don’t want it in the final object
    delete newDeduction._id;

    console.log("newDeduction", newDeduction);

    // if (conditionCategory.name === "Mobile") {
    if (MULTI_VARIANTS) {
      console.log("Creating condition for MULTI_VARIANTS");
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
    } else if (PROCESSOR_BASED) {
      console.log("Creating condition for Laptops");

      // Update "deductions" field of all the products of this category
      if (configCheck) {
        console.log("Configuration Condition");
        const productsUpdated = await Product.updateMany(
          { category: category }, // Update products of a specific category
          { $push: { simpleDeductions: newDeduction } }
        );
        console.log("productsUpdated", productsUpdated);
      } else {
        console.log("Non Configuration Condition");

        const processorsUpdated = await Processor.updateMany(
          {
            category: category, // Match products by category
          },
          {
            $push: {
              deductions: newDeduction, // Push new deduction to each processor's deductions array
            },
          }
        );
        console.log("processorsUpdated", processorsUpdated);
      }
    } else {
      console.log("Other category condition, updating in all products");

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
    const {
      conditionName,
      page,
      keyword,
      description,
      isMandatory,
      multiSelect,
      isYesNoType,
      showLabelsImage,
    } = req.body;
    const conditionId = req.params.conditionId;
    console.log("updateCondition Controller");
    // console.log("req.body", req.body);

    const conditionFound = await Condition.findById(conditionId);
    const conditionCategory = await Category.findById(conditionFound.category);
    // console.log("conditionCategory", conditionCategory);

    const MULTI_VARIANTS = conditionCategory.categoryType.multiVariants;
    const PROCESSOR_BASED = conditionCategory.categoryType.processorBased;

    let laptopDesktopCheck =
      conditionCategory.name === "Laptop" ||
      conditionCategory.name === "Desktop";

    // console.log("laptopDesktopCheck", laptopDesktopCheck);

    // NEW APPROACH TO UPDATE PRODUCTS DEDUCTIONS CONDITION
    // if (conditionCategory.name === "Mobile") {
    if (MULTI_VARIANTS) {
      console.log("Updating condition of a MULTI_VARIANTS");
      // Find all products of the same category
      const productsUpdated = await Product.updateMany(
        {
          category: conditionFound.category,
          "variantDeductions.deductions.conditionId": conditionId, // Match conditionId in deductions
        },
        {
          $set: {
            "variantDeductions.$[].deductions.$[deduction].conditionName":
              conditionName,
            "variantDeductions.$[].deductions.$[deduction].page": page,
            "variantDeductions.$[].deductions.$[deduction].keyword": keyword,
            "variantDeductions.$[].deductions.$[deduction].description":
              description,
            "variantDeductions.$[].deductions.$[deduction].isMandatory":
              isMandatory,
            "variantDeductions.$[].deductions.$[deduction].multiSelect":
              multiSelect,
            "variantDeductions.$[].deductions.$[deduction].isYesNoType":
              isYesNoType,
            "variantDeductions.$[].deductions.$[deduction].showLabelsImage":
              showLabelsImage,
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
            deduction.conditionName = conditionName;
            deduction.page = page;
            deduction.keyword = keyword;
            deduction.description = description;
            deduction.isMandatory = isMandatory;
            deduction.multiSelect = multiSelect;
            deduction.isYesNoType = isYesNoType;
            deduction.showLabelsImage = showLabelsImage;
          }
        });
        vq.save();
      }
      // } else if (laptopDesktopCheck) {
    } else if (PROCESSOR_BASED) {
      console.log("PROCESSOR_BASED condition to update");
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
              "simpleDeductions.$[elem].conditionName": conditionName,
              "simpleDeductions.$[elem].page": page,
              "simpleDeductions.$[elem].keyword": keyword,
              "simpleDeductions.$[elem].description": description,
              "simpleDeductions.$[elem].isMandatory": isMandatory,
              "simpleDeductions.$[elem].multiSelect": multiSelect,
              "simpleDeductions.$[elem].isYesNoType": isYesNoType,
              "simpleDeductions.$[elem].showLabelsImage": showLabelsImage,
            },
          },
          {
            arrayFilters: [{ "elem.conditionId": conditionId }], // Update the specific element in simpleDeductions array that matches conditionId
          }
        );
        console.log("productsUpdated", productsUpdated);
      } else {
        console.log("Non Config Deduction update");

        const processorsUpdated = await Processor.updateMany(
          {
            category: conditionCategory._id, // Match products by category
            "deductions.conditionId": conditionId, // Match the conditionId in the deductions array
          },
          {
            $set: {
              "deductions.$[elem].conditionName": conditionName,
              "deductions.$[elem].page": page,
              "deductions.$[elem].keyword": keyword,
              "deductions.$[elem].description": description,
              "deductions.$[elem].isMandatory": isMandatory,
              "deductions.$[elem].multiSelect": multiSelect,
              "deductions.$[elem].isYesNoType": isYesNoType,
              "deductions.$[elem].showLabelsImage": showLabelsImage,
            },
          },
          {
            arrayFilters: [{ "elem.conditionId": conditionId }], // Update the specific element that matches the conditionId
          }
        );
        console.log("processorsUpdated", processorsUpdated);
      }
    } else {
      console.log("Simple category condition, updating in products");
      const productsUpdated = await Product.updateMany(
        {
          category: conditionFound.category, // Match by category
          "simpleDeductions.conditionId": conditionId, // Match the conditionId within simpleDeductions array
        },
        {
          $set: {
            "simpleDeductions.$[elem].conditionName": conditionName, // Update the conditionName
            "simpleDeductions.$[elem].page": page, // Update the page
            "simpleDeductions.$[elem].keyword": keyword,
            "simpleDeductions.$[elem].description": description,
            "simpleDeductions.$[elem].isMandatory": isMandatory,
            "simpleDeductions.$[elem].multiSelect": multiSelect,
            "simpleDeductions.$[elem].isYesNoType": isYesNoType,
            "simpleDeductions.$[elem].showLabelsImage": showLabelsImage,
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
  try {
    const conditionCategory = await Category.findById(category);
    const deletedCondition = await Condition.findByIdAndDelete(conditionId);

    const MULTI_VARIANTS = conditionCategory.categoryType.multiVariants;
    const PROCESSOR_BASED = conditionCategory.categoryType.processorBased;

    const variantsQuestions = await VariantQuestion.find();

    const associatedConditionLabels = await ConditionLabel.find({
      conditionNameId: conditionId,
    });

    // call deleteImage function for each conditionLabel of the condition and unlink its images
    associatedConditionLabels.map((conditionLabel) => {
      if (conditionLabel.conditionLabelImg) {
        deleteImage(conditionLabel.conditionLabelImg);
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
    // if (conditionCategory.name.toLowerCase().includes("mobile")) {
    if (MULTI_VARIANTS) {
      console.log("Inside MULTI_VARIANTS");
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
      // } else if (laptopDesktopCheck) {
    } else if (PROCESSOR_BASED) {
      console.log("Inside PROCESSOR_BASED");

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
          const processorUpdated = await Processor.deleteMany({
            category: category, // Match by category
          });

          console.log("processorUpdated", processorUpdated);
        }
      } else {
        console.log("Deleting non-config condition");

        // Find all products of the specific category
        const processorUpdated = await Processor.updateMany(
          {
            category: category, // Match by category
            "deductions.conditionId": conditionId, // Match by conditionId within the deductions array in processorBasedDeduction
          },
          {
            $pull: {
              deductions: { conditionId: conditionId }, // Remove the deduction object where conditionId matches
            },
          }
        );

        console.log("processorUpdated", processorUpdated);
      }
    } else {
      console.log("Simple category condition, deleting in products");
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

    // Extract existing condition names
    const existingConditionLabels = allConditionLabels.map(
      (cl) =>
        cl.conditionNameId == conditionNameId &&
        cl.conditionLabel == conditionLabel
    );

    let laptopDesktopCheck =
      cLCategory.name === "Laptop" || cLCategory.name === "Desktop";

    const MULTI_VARIANTS = cLCategory.categoryType.multiVariants;
    const PROCESSOR_BASED = cLCategory.categoryType.processorBased;

    // Before creating a condition label for Laptop/Desktop at least one Windows & one IOS system must be created
    // if (laptopDesktopCheck) {
    if (PROCESSOR_BASED) {
      const APPLE_BRAND = await Brand.findOne({
        category: cLCategory.id,
        name: "Apple",
      });

      // const NON_APPLE_BRAND = await Brand.findOne({
      const NON_APPLE_BRAND = await Brand.find({
        category: cLCategory.id,
        name: { $ne: "Apple" }, // Excludes brands with the name "Apple"
      });

      console.log("APPLE_BRAND of laptop", APPLE_BRAND?.name);
      console.log("NON_APPLE_BRAND of laptop", NON_APPLE_BRAND?.name);

      const APPLE_PROD_LEN = APPLE_BRAND?.products?.length || 0;
      // const WINDOWS_PROD_LEN = NON_APPLE_BRAND?.products?.length || 0;

      const WINDOWS_PROD_LEN = (NON_APPLE_BRAND || []).reduce(
        (total, brand) => {
          const count = brand?.products?.length || 0;
          return total + count;
        },
        0
      );

      console.log("APPLE_PROD_LEN ", APPLE_PROD_LEN);
      console.log("WINDOWS_PROD_LEN", WINDOWS_PROD_LEN);

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

    // if (cLCategory.name === "Mobile") {
    if (MULTI_VARIANTS) {
      console.log("Updating created condition label into MULTI_VARIANTS");
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
      // } else if (laptopDesktopCheck) {
    } else if (PROCESSOR_BASED) {
      console.log("Pushing created condition label into PROCESSOR_BASED");

      // console.log("category", category, "conditionNameId", conditionNameId);

      const condition = await Condition.findById(conditionNameId);
      console.log("condition of the conditionLabel", condition.conditionName);
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

          // Pushing/Creating PROCESSOR on all products simpleDeductions
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

          // const prod = await Product.findOne({ category });
          // console.log("product of this System category", prod.name);

          const processor = await Processor.findOne({ category });
          console.log("processor of System category", processor?.processorName);

          const oldProcessorBasedDeductionExist =
            processor?.deductions.length > 0;

          console.log(
            "oldProcessorBasedDeductionExist",
            oldProcessorBasedDeductionExist
          );

          const newProcBasDeduc = {
            category: category,
            processorId: newConditionLabel._id,
            processorName: newConditionLabel.conditionLabel,
            deductions: oldProcessorBasedDeductionExist
              ? processor.deductions
              : [],
          };

          let processorCreated = await Processor.create(newProcBasDeduc);
          processorCreated.save();
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
        const processorsUpdated = await Processor.updateMany(
          {
            category: category, // Match documents by category
            "deductions.conditionId": conditionNameId, // Match by conditionId within deductions
          },
          {
            $push: {
              "deductions.$[deduction].conditionLabels": {
                conditionLabelId: newConditionLabel._id,
                conditionLabel: newConditionLabel.conditionLabel,
                conditionLabelImg: newConditionLabel.conditionLabelImg,
                operation: "Subtrack",
              },
            },
          },
          {
            arrayFilters: [
              { "deduction.conditionId": conditionNameId }, // Filter by matching conditionId within deductions array
            ],
            multi: true, // Ensure multiple documents are updated
          }
        );

        console.log("processorsUpdated", processorsUpdated);
      }
    } else {
      console.log("Simple category conditionLabel, creation in all products");

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

    newConditionLabel.save();

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

    let laptopDesktopCheck =
      cLCategory.name === "Laptop" || cLCategory.name === "Desktop";

    const MULTI_VARIANTS = cLCategory.categoryType.multiVariants;
    const PROCESSOR_BASED = cLCategory.categoryType.processorBased;

    // if (cLCategory.name === "Mobile") {
    if (MULTI_VARIANTS) {
      console.log("Updating condition label into all MULTI_VARIANTS products");
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
      // } else if (laptopDesktopCheck) {
    } else if (PROCESSOR_BASED) {
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

          const processorsUpdated = await Processor.updateMany(
            {
              category: category, // Match by category
              processorId: conditionLabelId, // Match by processorId
            },
            {
              $set: { processorName: conditionLabel }, // Update the processorName
            }
          );

          console.log("processorsUpdated", processorsUpdated);
        }
      } else {
        console.log("Updating conditionLabel of non configuration conditions");

        const processorsUpdated = await Processor.updateMany(
          {
            category: category, // Match processors by category
            "deductions.conditionId": conditionNameId, // Match deductions where conditionId equals conditionNameId
          },
          {
            $set: {
              "deductions.$[deduction].conditionLabels.$[label].conditionLabel":
                conditionLabel, // Update conditionLabel
              "deductions.$[deduction].conditionLabels.$[label].conditionLabelImg":
                conditionLabelImg, // Optionally update conditionLabelImg
            },
          },
          {
            arrayFilters: [
              { "deduction.conditionId": conditionNameId }, // Match the correct deduction by conditionId
              { "label.conditionLabelId": conditionLabelId }, // Match the correct conditionLabel within the deduction
            ],
            multi: true, // Apply to multiple documents
          }
        );

        console.log("processorsUpdated", processorsUpdated);
      }
    } else {
      console.log("Simple category conditionLabel, updating in all products");
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
      deleteImage(deletedLabel.conditionLabelImg);
    } else {
      console.log("Image not available");
    }

    // Step 2: Update products to remove the deleted conditionLabel

    let laptopDesktopCheck =
      cLCategory.name === "Laptop" || cLCategory.name === "Desktop";

    const MULTI_VARIANTS = cLCategory.categoryType.multiVariants;
    const PROCESSOR_BASED = cLCategory.categoryType.processorBased;

    // if (cLCategory.name === "Mobile") {
    if (MULTI_VARIANTS) {
      console.log("Delete inside MULTI_VARIANTS");
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
      // } else if (laptopDesktopCheck) {
    } else if (PROCESSOR_BASED) {
      console.log("Delete inside PROCESSOR_BASED");
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
          console.log("Deleting processor from Processors collection");
          const processorDeleted = await Processor.deleteOne({
            category: category, // Match processors by category
            processorId: conditionLabelId, // Match processors by processorId (which is set as conditionLabelId)
          });

          console.log("processorDeleted", processorDeleted);
        }
      } else {
        console.log(
          "Deleting ConditionLabel which are not from configuration conditions"
        );
        const processorsUpdated = await Processor.updateMany(
          {
            category: category, // Match documents by category (if needed)
            "deductions.conditionId": deletedLabel.conditionNameId, // Match by conditionId within deductions
          },
          {
            $pull: {
              "deductions.$[deduction].conditionLabels": {
                conditionLabelId: conditionLabelId, // Pull the specific conditionLabel by ID
              },
            },
          },
          {
            arrayFilters: [
              { "deduction.conditionId": deletedLabel.conditionNameId }, // Ensure deduction matches the conditionId
            ],
            multi: true, // Update multiple documents
          }
        );

        console.log("processorsUpdated", processorsUpdated);
      }
    } else {
      console.log("Delete inside Simple category conditionLabel");

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
