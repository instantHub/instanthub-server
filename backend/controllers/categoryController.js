import Brand from "../models/brandModel.js";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";

import Condition from "../models/conditionModel.js";
import ConditionLabel from "../models/conditionLabelModel.js";
import { deleteImage } from "../utils/deleteImage.js";
import Order from "../models/orderModel.js";

export const createCategory = async (req, res) => {
  try {
    const { name, uniqueURL, image, categoryType } = req.body;

    // Check if a category with the same name already exists (case-insensitive)
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingCategory) {
      return res
        .status(409)
        .json({ msg: `Category (${name}) already exists.` });
    }

    const newCategory = await Category.create({
      name,
      uniqueURL,
      categoryType,
      image,
    });
    return res.status(201).json(newCategory);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  console.log("getCategories Controller");

  try {
    const categories = await Category.find().populate("brands", [
      "name",
      "uniqueURL",
    ]);
    // console.log('categories',categories);
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(404)
      .json({ message: "Error in GET categories" + error.message });
  }
};

export const getCategory = async (req, res) => {
  console.log("getCategory Controller");

  const { categoryUniqueURL } = req.params;

  try {
    const category = await Category.findOne({
      uniqueURL: categoryUniqueURL,
    }).populate("brands", ["name", "image", "uniqueURL"]);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in GET categories" + error.message });
  }
};

export const updateCategory = async (req, res) => {
  console.log("Update Category controller");
  const { categoryId } = req.params;
  console.log(categoryId);

  console.log("body", req.body);

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      req.body,
      {
        new: true,
      }
    );
    return res.status(201).json(updatedCategory);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

export const deleteCategory = async (req, res) => {
  console.log("Delete Category controller");
  const { catId } = req.params;

  try {
    // 1. Delete category
    const deletedCategory = await Category.findByIdAndDelete(catId);
    // console.log("deletedCategory", deletedCategory);
    // console.log("deletedCategory brands", deletedCategory.brands);

    // 2. Delete image from uploads/ of the deleted Category
    deleteImage(deletedCategory.image);

    // BRANDS
    // 3. Find the associated Brands of the deleted Category
    const associatedBrands = await Brand.find({ category: deletedCategory.id });
    // console.log("associatedBrands", associatedBrands);

    // 4. Delete images of each Brand of the Deleted Category and unlink its image
    associatedBrands.map((brand) => {
      deleteImage(brand.image);
    });

    // 5. Delete the associated Brands
    const deletedBrands = await Brand.deleteMany({
      category: deletedCategory.id,
    });

    console.log("Deleted ", deletedBrands.deletedCount, " associated brands");

    // PRODUCTS
    // 6. Find the associated Products of the deleted Category
    const associatedProducts = await Product.find({
      category: deletedCategory.id,
    });

    // 7. Delete images of each Product of the Deleted Category and unlink its image
    associatedProducts.map((product) => {
      deleteImage(product.image);
    });

    // 8. Delete the associated Products
    const deletedProducts = await Product.deleteMany({
      category: deletedCategory.id,
    });

    console.log(
      "Deleted ",
      deletedProducts.deletedCount,
      " associated product"
    );

    // 9. Delete the Conditions of Deleted Category
    const deletedConditions = await Condition.deleteMany({
      category: deletedCategory.id,
    });

    console.log(
      "Deleted ",
      deletedConditions.deletedCount,
      " associated Conditions"
    );

    // 10. Find the ConditionLabels of the Deleted Category
    const associatedConditionLabels = await ConditionLabel.find({
      category: deletedCategory._id,
    });

    // 11. Delete images of each conditionLabel of the Deleted Category and unlink its image
    associatedConditionLabels.map((conditionLabel) => {
      if (conditionLabel.conditionLabelImg)
        deleteImage(conditionLabel.conditionLabelImg);
    });

    // 12. Delete the associated conditionLabel
    const deletedConditionLabels = await ConditionLabel.deleteMany({
      category: deletedCategory._id,
    });

    console.log(
      "Deleted ",
      deletedConditionLabels.deletedCount,
      " associated ConditionLabels"
    );

    res.status(200).json({
      DeletedCategory: deletedCategory,
      message: "Category delete successfully",
    });
  } catch (error) {
    console.log("Internal server error while deleting Category.", error);
    return res.status(500).json({
      message: "Internal server error while deleting Category.",
      error,
    });
  }
};

export const topSellingProducts = async (req, res) => {
  console.log("topSellingProducts Controller");
  try {
    const { categoryName } = req.params;

    const products = await Order.find(
      {
        productCategory: categoryName,
        "status.completed": true,
      },
      {
        productId: 1, // include only the productId field
        _id: 0, // exclude the Order document _id if desired
      }
    )
      .populate({
        path: "productId",
        populate: [{ path: "category" }, { path: "brand" }],
      })
      .lean();

    console.log("top selling products:", products.length);

    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in top selling products:" + error.message });
  }
};
