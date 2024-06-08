import path from "path";
import fs from "fs";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import ConditionLabel from "../models/conditionLabelModel.js";

export const deleteCLImage = async (req, res) => {
  console.log("deleteImage Controller");
  console.log(req.body);
  const { category, conditionNameId, conditionLabelId, conditionLabelImg } =
    req.body;
  //   console.log(imageURL);
  try {
    const conditionLabel = await ConditionLabel.findByIdAndUpdate(
      conditionLabelId,
      { $unset: { conditionLabelImg: "" } },
      { new: true }
    );
    console.log(conditionLabel, "conditionLabel");

    const cLCategory = await Category.findById(category);
    console.log("cLCategory", cLCategory);

    if (cLCategory.name === "Mobile") {
      const updatedProducts = await Product.updateMany(
        {
          category: category,
          "variantDeductions.variantName": { $exists: true },
        }, // Find products with variants
        {
          $unset: {
            "variantDeductions.$[variant].deductions.$[condition].conditionLabels.$[label].conditionLabelImg":
              "",
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
    } else if (cLCategory.name !== "Mobile") {
      await Product.updateMany(
        {
          category: category, // Match by category
          "simpleDeductions.conditionId": conditionNameId, // Match by conditionId
          "simpleDeductions.conditionLabels.conditionLabelId": conditionLabelId, // Match by conditionLabelId
        },
        {
          $unset: {
            "simpleDeductions.$[outer].conditionLabels.$[inner].conditionLabelImg":
              "",
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

    // Delete the corresponding image file from the uploads folder
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

    return res.status(201).json("deletedLabel");
  } catch (err) {
    console.error(`Error deleteImage Controller`, err);
  }
};
