import Brand from "../models/brandModel.js";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import path from "path";
import fs from "fs";
import Condition from "../models/conditionModel.js";
import ConditionLabel from "../models/conditionLabelModel.js";

export const addCategory = async (req, res) => {
  try {
    let categories = await Category.find();
    if (categories.length > 0) {
      let checking = false;

      categories.map((cat, i) => {
        if (cat.name.toLowerCase() === req.body.name.toLowerCase()) {
          checking = true;
        }

        // if (cat.name === req.body.name) {
        //   checking = true;
        // }
      });

      if (checking == false) {
        let category = await Category.create({
          name: req.body.name,
          uniqueURL: req.body.uniqueURL,
          image: req.body.image,
        });
        category.save();
        res.status(200).json(category);
      } else {
        res
          .status(200)
          .send({ msg: "category (" + req.body.name + ") already exist " });
      }
    } else {
      let category = await Category.create({
        name: req.body.name,
        uniqueURL: req.body.uniqueURL,
        image: req.body.image,
      });
      category.save();
      res.status(200).json(category);
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getCategory = async (req, res) => {
  // filter = {"category":["smartphone","laptops"]}
  // sort = {_sort:"price",_order="desc"}
  // pagination = {_page:1,_limit=10}
  // let condition = {};
  // if (!req.query.admin) {
  //   condition.deleted = { $ne: true };
  // }

  // let condition = {};

  // let query = Category.find(condition);
  // console.log("query", query);
  // // let totalProductsQuery = Product.find(condition);

  // console.log(req.query);

  // if (req.query._sort && req.query._order) {
  //   query = query.sort({ [req.query._sort]: req.query._order });
  // }

  // try {
  //   const docs = await query.exec();
  //   // res.set('X-Total-Count', totalDocs);
  //   res.status(200).json(docs);
  // } catch (err) {
  //   res.status(400).json(err);
  // }

  try {
    const categories = await Category.find().populate("brands", "name");
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(404)
      .json({ message: "Error in GET categories" + error.message });
  }
};

export const updateCategory = async (req, res) => {
  console.log("Update Category controller");
  const catId = req.params.catId;
  console.log(catId);

  console.log("body", req.body);

  try {
    const updatedCategory = await Category.findByIdAndUpdate(catId, req.body, {
      new: true,
    });
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
      category: deletedCategory.id,
    });

    // 11. Delete images of each conditionLabel of the Deleted Category and unlink its image
    associatedConditionLabels.map((conditionLabel) => {
      deleteImage(conditionLabel.conditionLabelImg);
    });

    // 12. Delete the associated conditionLabel
    const deletedConditionLabels = await ConditionLabel.deleteMany({
      category: deletedCategory.id,
    });

    console.log(
      "Deleted ",
      deletedConditionLabels.deletedCount,
      " associated ConditionLabels"
    );

    // Delete the corresponding image file from the uploads folder
    function deleteImage(image) {
      const __dirname = path.resolve();
      const imagePath = path.join(__dirname, image);
      console.log("imagePath", image);

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

    res.status(200).json({
      DeletedCategory: deletedCategory,
      message: "Category delete successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while deleting Category.",
      error,
    });
  }
};
