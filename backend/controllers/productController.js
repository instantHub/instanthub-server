import Product from "../models/productModel.js";
import Brand from "../models/brandModel.js";
import Category from "../models/categoryModel.js";
import Condition from "../models/conditionModel.js";
import ConditionLabel from "../models/conditionLabelModel.js";
import path from "path";
import fs from "fs";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("brand", "name");
    // console.log(products);

    res.status(200).json(products);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getProductsByBrand = async (req, res) => {
  try {
    const brandId = req.params.brandId;
    console.log(brandId);

    const brandWithProducts = await Brand.findById(brandId).populate(
      "products"
    );

    console.log("productsController GetProducts");
    // console.log(brandWithProducts);

    const products = brandWithProducts.products;

    res.status(200).json(products);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getProductDetails = async (req, res) => {
  try {
    const prodId = req.params.prodId;
    console.log(prodId);
    const product = await Product.findById(prodId)
      .populate("category", "name")
      .populate("brand", "name");

    console.log("productsController GetProductDetails");
    console.log(product);

    res.status(200).json(product);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const products = await Product.find({ brand: req.body.brand });
    const productBrand = await Brand.findById(req.body.brand);
    const productCategory = await Category.findById(req.body.category);
    const conditionsList = await Condition.find({
      category: req.body.category,
    });
    const conditionLabelsList = await ConditionLabel.find({
      category: req.body.category,
    });

    if (products.length > 0) {
      let duplicate = false;

      products.map((product) => {
        // console.log(typeof product.name);
        if (product.name.toLowerCase() === req.body.name.toLowerCase()) {
          duplicate = true;
        }
      });
      console.log(duplicate);

      if (duplicate == false) {
        let deductions = [
          {
            conditionName: "",
            conditionLabels: [
              {
                conditionLabel: "",
                conditionLabelImg: "",
              },
            ],
          },
        ];

        // Map conditions and condition labels to deductions array
        deductions = conditionsList.map((condition) => ({
          conditionId: condition.id,
          conditionName: condition.conditionName,
          conditionLabels: conditionLabelsList
            .filter((label) => label.conditionNameId == condition.id)
            .map((label) => ({
              conditionLabelId: label.id,
              conditionLabel: label.conditionLabel,
              conditionLabelImg: label.conditionLabelImg,
              // priceDrop: 0, // Default price drop, can be updated later
            })),
        }));

        console.log(deductions);

        let product = await Product.create({
          name: req.body.name,
          uniqueURL: req.body.uniqueURL,
          image: req.body.image,
          category: req.body.category,
          brand: req.body.brand,
          variants: req.body.variants,
          deductions: deductions,
        });
        product.save();

        // push the new product into its brand's products array & save
        productBrand.products.push(product);
        productBrand.save();

        res.status(200).json(product);
      } else if (duplicate == true) {
        // TODO Task, Unique Name Validation not working
        res.status(200).send({
          success: false,
          data: "Duplicate productName",
          message: "Product " + req.body.name + " already exist ",
        });
      }
    } else {
      let deductions = [
        {
          conditionName: "",
          conditionLabels: [
            {
              conditionLabel: "",
              conditionLabelImg: "",
            },
          ],
        },
      ];

      // Map conditions and condition labels to deductions array
      deductions = conditionsList.map((condition) => ({
        conditionId: condition.id,
        conditionName: condition.conditionName,
        conditionLabels: conditionLabelsList
          .filter((label) => label.conditionNameId == condition.id)
          .map((label) => ({
            conditionLabelId: label.id,
            conditionLabel: label.conditionLabel,
            conditionLabelImg: label.conditionLabelImg,
            // priceDrop: 0, // Default price drop, can be updated later
          })),
      }));

      let product = await Product.create({
        name: req.body.name,
        uniqueURL: req.body.uniqueURL,
        image: req.body.image,
        category: req.body.category,
        brand: req.body.brand,
        variants: req.body.variants,
        deductions: deductions,
      });
      product.save();

      // push the new product into its brand's products array & save
      productBrand.products.push(product);
      productBrand.save();

      res.status(200).json(product);
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  console.log("DeleteProduct Controller");
  const productId = req.params.productId;
  // console.log(productId);

  const deletedProduct = await Product.findByIdAndDelete(productId);
  // console.log(deletedProduct);

  const brand = await Brand.findById(deletedProduct.brand);
  // console.log(brand);
  brand.products.pull(productId);
  await brand.save();

  // Delete the corresponding image file from the uploads folder
  const __dirname = path.resolve();
  const imagePath = path.join(__dirname, deletedProduct.image);
  console.log("imagePath", deletedProduct.image);

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

  // try {
  //   fs.unlink(imagePath, (err) => {
  //     if (err) {
  //       console.error("Error deleting image:", err);
  //       return res.status(201).json({ message: "Error deleting image" });
  //     }
  //   });
  //   // fs.unlink(imagePath);
  //   // console.log("Image deleted successfully");
  // } catch (err) {
  //   if (err.code === "ENOENT") {
  //     // Handle the case where the file doesn't exist
  //     console.log(`Image ${imagePath} does not exist.`);
  //   } else {
  //     // Handle other errors
  //     console.error(`Error deleting image ${imagePath}:`, err);
  //   }
  // }

  res.status(200).json({ data: deletedProduct });
};

// update Product's Deductions PRICEDROP value for a single Product
export const updatePriceDrop = async (req, res) => {
  console.log("updatePriceDrop Controller");
  const productId = req.params.productId;
  console.log(productId);
  let updatedProductData = req.body;
  // console.log("updatedProductsData", updatedProductData);

  updatedProductData = {
    ...updatedProductData,
    category: updatedProductData.category.id,
    brand: updatedProductData.brand.id,
  };

  // console.log("After updatedProductData", updatedProductData);

  try {
    // Update the product with the complete updated data
    await Product.findByIdAndUpdate(productId, updatedProductData, {
      new: true,
    });

    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
