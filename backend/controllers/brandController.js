import Brand from "../models/brandModel.js";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";

import { deleteImage } from "../utils/deleteImage.js";

export const getAllBrands = async (req, res) => {
  try {
    const brand = await Brand.find().populate("category");
    console.log(brand);

    res.status(200).json(brand);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getBrand = async (req, res) => {
  console.log("getBrand Controller");

  const { brandId } = req.params;
  console.log("brandId", brandId);

  try {
    // Step 2: Find brands linked to this category
    const brands = await Brand.findById(brandId).populate("category");

    res.status(200).json(brands);
  } catch (error) {
    console.error("Error in getBrands:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getBrands = async (req, res) => {
  console.log("getBrands Controller");

  const { categoryUniqueURL } = req.params;
  console.log("Category slug from brandController", categoryUniqueURL);

  try {
    // Step 1: Get category by uniqueURL
    const category = await Category.findOne({ uniqueURL: categoryUniqueURL });
    console.log("category", category);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Step 2: Find brands linked to this category
    const brands = await Brand.find({ category: category._id }).populate(
      "category"
    );

    res.status(200).json(brands);
  } catch (error) {
    console.error("Error in getBrands:", error);
    res.status(500).json({ message: error.message });
  }
};

export const addBrand = async (req, res) => {
  console.log("addBrand Controller");
  try {
    let brands = await Brand.find();

    // console.log("req.body", req.body);
    console.log("req.body.category", req.body.category);

    let categoryFound = await Category.findById(req.body.category);

    // console.log("category from brandController", categoryFound);

    if (categoryFound) {
      if (brands.length > 0) {
        let checking = false;

        brands.map((brand, i) => {
          if (brand.name.toLowerCase() === req.body.name.toLowerCase()) {
            // console.log(brand.category, req.body.category);
            // console.log("brand.category", brand.category == req.body.category);
            if (brand.category == req.body.category) {
              checking = true;
            }
          }
        });

        if (checking == false) {
          let brand = await Brand.create({
            category: req.body.category,
            name: req.body.name,
            uniqueURL: req.body.uniqueURL,
            image: req.body.image,
          });
          brand.save();

          // push the brand into its category's brands array & save
          categoryFound.brands.push(brand);
          categoryFound.save();

          res.status(200).json(brand);
        } else {
          res.status(200).send({
            msg:
              "Brand (" +
              req.body.name +
              ") in the category (" +
              req.body.category +
              ")already exist ",
          });
        }
      } else {
        let brand = await Brand.create({
          category: req.body.category,
          name: req.body.name,
          uniqueURL: req.body.uniqueURL,
          image: req.body.image,
        });
        brand.save();
        categoryFound.brands.push(brand);
        categoryFound.save();
        res.status(200).json(brand);
      }
    } else {
      res
        .status(404)
        .json({ msg: "Category (" + req.body.category + ") doesn't exist " });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateBrand = async (req, res) => {
  console.log("Update Brand controller");
  const brandId = req.params.brandId;
  console.log(brandId);

  console.log("body", req.body);

  try {
    const updatedBrand = await Brand.findByIdAndUpdate(brandId, req.body, {
      new: true,
    });
    return res.status(201).json(updatedBrand);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

// DELETE Brand
export const deleteBrand = async (req, res) => {
  console.log("Delete Brand controller");
  const brandId = req.params.brandId;

  try {
    // 1. Delete brand
    const deletedBrand = await Brand.findByIdAndDelete(brandId);
    console.log("deletedBrand", deletedBrand);
    console.log("deletedBrand cat", deletedBrand.category);

    // 2. Delete image from uploads/ of the deleted Brand
    deleteImage(deletedBrand.image);

    // 3. Remove Brand from its category Array
    const brandCategory = await Category.findById(deletedBrand.category);
    brandCategory.brands.pull(deletedBrand.id);
    await brandCategory.save();

    // 4. Find the associated products with the deleted brand
    const associatedProducts = await Product.find({ brand: deletedBrand.id });
    // console.log(associatedProducts);

    // 5. Call deleteImage function for each product of the brand and unlink its image
    associatedProducts.map((product) => {
      deleteImage(product.image);
    });

    // 6. Delete the associated Products
    const deletedProducts = await Product.deleteMany({
      brand: deletedBrand.id,
    });

    console.log(
      "Deleted ",
      deletedProducts.deletedCount,
      " associated product"
    );

    return res.status(201).json(deletedBrand);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error while deleting Brand.", error });
  }
};
